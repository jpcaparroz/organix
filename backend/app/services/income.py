import datetime
from typing import List, Optional
import uuid
import decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ResourceNotFoundException, ValidationError
from app.models.incomes import Income, IncomeStatus
from app.repositories.income import IncomeRepository
from app.repositories.income_category import IncomeCategoryRepository
from app.repositories.payment_method import PaymentMethodRepository
from app.schemas.incomes import IncomeCreate, IncomeUpdate
from app.services.expense import add_months


class IncomeService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = IncomeRepository(session)
        self.category_repo = IncomeCategoryRepository(session)
        self.payment_repo = PaymentMethodRepository(session)

    async def _validate_foreign_keys(
        self, user_id: uuid.UUID, category_id: uuid.UUID, payment_method_id: uuid.UUID
    ):
        category = await self.category_repo.get(category_id, user_id=user_id)
        if not category:
            raise ResourceNotFoundException("Income Category")

        payment = await self.payment_repo.get(payment_method_id, user_id=user_id)
        if not payment:
            raise ResourceNotFoundException("Payment Method")

    async def create_income(self, user_id: uuid.UUID, income_in: IncomeCreate) -> List[Income]:
        await self._validate_foreign_keys(
            user_id, income_in.income_category_id, income_in.payment_method_id
        )

        qty = income_in.installment_quantity
        if qty < 1:
            raise ValidationError("Installment quantity must be at least 1")

        created_incomes = []

        if qty == 1:
            db_income = Income(
                user_id=user_id,
                income_category_id=income_in.income_category_id,
                payment_method_id=income_in.payment_method_id,
                amount=income_in.amount,
                date=income_in.date,
                name=income_in.name,
                description=income_in.description,
                status=income_in.status,
            )
            saved = await self.repo.create(db_income)
            created_incomes.append(saved)
        else:
            transaction_group_id = uuid.uuid4()
            inst_amount = (income_in.amount / qty).quantize(
                decimal.Decimal("0.01"), rounding=decimal.ROUND_DOWN
            )
            diff = income_in.amount - (inst_amount * qty)

            for i in range(1, qty + 1):
                current_amount = inst_amount + (diff if i == 1 else 0)
                current_date = add_months(income_in.date, i - 1)

                db_income = Income(
                    user_id=user_id,
                    income_category_id=income_in.income_category_id,
                    payment_method_id=income_in.payment_method_id,
                    transaction_group_id=transaction_group_id,
                    amount=current_amount,
                    date=current_date,
                    name=f"{income_in.name} ({i}/{qty})",
                    description=income_in.description,
                    status=income_in.status,
                    installment_current=i,
                    installment_total=qty,
                )
                saved = await self.repo.create(db_income)
                created_incomes.append(saved)

        return created_incomes

    async def get_income(self, user_id: uuid.UUID, income_id: uuid.UUID) -> Income:
        income = await self.repo.get(income_id, user_id=user_id)
        if not income:
            raise ResourceNotFoundException("Income")
        return income

    async def list_incomes(
        self,
        user_id: uuid.UUID,
        start_date: Optional[datetime.date] = None,
        end_date: Optional[datetime.date] = None,
        income_category_id: Optional[uuid.UUID] = None,
        status: Optional[IncomeStatus] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Income]:
        return await self.repo.get_by_date_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            income_category_id=income_category_id,
            status=status,
            skip=skip,
            limit=limit,
        )

    async def count_incomes(
        self,
        user_id: uuid.UUID,
        start_date: Optional[datetime.date] = None,
        end_date: Optional[datetime.date] = None,
        income_category_id: Optional[uuid.UUID] = None,
        status: Optional[IncomeStatus] = None,
    ) -> int:
        return await self.repo.count_by_date_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            income_category_id=income_category_id,
            status=status,
        )

    async def update_income(
        self,
        user_id: uuid.UUID,
        income_id: uuid.UUID,
        income_up: IncomeUpdate,
        update_type: str = "single",
    ) -> Income:
        income = await self.get_income(user_id, income_id)

        cat_id = income_up.income_category_id or income.income_category_id
        pay_id = income_up.payment_method_id or income.payment_method_id
        await self._validate_foreign_keys(user_id, cat_id, pay_id)

        update_dict = income_up.model_dump(exclude_unset=True)

        if update_type == "single" or not income.transaction_group_id:
            return await self.repo.update(income, update_dict)

        # Handle subsequent or all updates for installments
        group_items = await self.repo.get_by_transaction_group(
            user_id, income.transaction_group_id
        )

        for item in group_items:
            should_update = False
            if update_type == "all":
                should_update = True
            elif (
                update_type == "subsequent"
                and item.installment_current >= income.installment_current
            ):
                should_update = True

            if should_update:
                item_update = update_dict.copy()
                if "name" in item_update and item_update["name"]:
                    base_name = item_update["name"]
                    item_update["name"] = f"{base_name} ({item.installment_current}/{item.installment_total})"
                
                if "date" in item_update and item_update["date"]:
                    diff_months = item.installment_current - income.installment_current
                    item_update["date"] = add_months(item_update["date"], diff_months)

                await self.repo.update(item, item_update)

        await self.session.refresh(income)
        return income

    async def delete_income(
        self, user_id: uuid.UUID, income_id: uuid.UUID, delete_type: str = "single"
    ) -> None:
        income = await self.get_income(user_id, income_id)

        if delete_type == "single" or not income.transaction_group_id:
            await self.repo.soft_delete(income)
            return

        group_items = await self.repo.get_by_transaction_group(
            user_id, income.transaction_group_id
        )

        for item in group_items:
            should_delete = False
            if delete_type == "all":
                should_delete = True
            elif (
                delete_type == "subsequent"
                and item.installment_current >= income.installment_current
            ):
                should_delete = True

            if should_delete:
                await self.repo.soft_delete(item)
