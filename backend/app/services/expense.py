import datetime
from typing import List, Optional
import uuid
import decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ResourceNotFoundException, ValidationError, PermissionDeniedException
from app.models.expenses import Expense, ExpenseStatus
from app.repositories.expense import ExpenseRepository
from app.repositories.expense_category import ExpenseCategoryRepository
from app.repositories.payment_method import PaymentMethodRepository
from app.schemas.expenses import ExpenseCreate, ExpenseUpdate


def add_months(orig_date: datetime.date, months: int) -> datetime.date:
    """Helper to add months to a date, capping at the last day of the target month."""
    month = orig_date.month - 1 + months
    year = orig_date.year + month // 12
    month = month % 12 + 1
    # Number of days in each month
    is_leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
    days_in_month = [
        31,
        29 if is_leap else 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ]
    day = min(orig_date.day, days_in_month[month - 1])
    return datetime.date(year, month, day)


class ExpenseService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = ExpenseRepository(session)
        self.category_repo = ExpenseCategoryRepository(session)
        self.payment_repo = PaymentMethodRepository(session)

    async def _validate_foreign_keys(
        self, user_id: uuid.UUID, category_id: uuid.UUID, payment_method_id: uuid.UUID
    ):
        """Validate that category and payment method exist and belong to the user."""
        category = await self.category_repo.get(category_id, user_id=user_id)
        if not category:
            raise ResourceNotFoundException("Expense Category")

        payment = await self.payment_repo.get(payment_method_id, user_id=user_id)
        if not payment:
            raise ResourceNotFoundException("Payment Method")

    async def create_expense(self, user_id: uuid.UUID, expense_in: ExpenseCreate) -> List[Expense]:
        # Validate foreign keys
        await self._validate_foreign_keys(
            user_id, expense_in.expense_category_id, expense_in.payment_method_id
        )

        qty = expense_in.installment_quantity
        if qty < 1:
            raise ValidationError("Installment quantity must be at least 1")

        created_expenses = []

        if qty == 1:
            db_expense = Expense(
                user_id=user_id,
                expense_category_id=expense_in.expense_category_id,
                payment_method_id=expense_in.payment_method_id,
                amount=expense_in.amount,
                date=expense_in.date,
                name=expense_in.name,
                description=expense_in.description,
                status=expense_in.status,
                tags=expense_in.tags,
            )
            saved = await self.repo.create(db_expense)
            created_expenses.append(saved)
        else:
            transaction_group_id = uuid.uuid4()
            
            # Divide amount into installments accurately
            inst_amount = (expense_in.amount / qty).quantize(
                decimal.Decimal("0.01"), rounding=decimal.ROUND_DOWN
            )
            diff = expense_in.amount - (inst_amount * qty)

            for i in range(1, qty + 1):
                # Add difference to the first installment
                current_amount = inst_amount + (diff if i == 1 else 0)
                current_date = add_months(expense_in.date, i - 1)

                db_expense = Expense(
                    user_id=user_id,
                    expense_category_id=expense_in.expense_category_id,
                    payment_method_id=expense_in.payment_method_id,
                    transaction_group_id=transaction_group_id,
                    amount=current_amount,
                    date=current_date,
                    name=f"{expense_in.name} ({i}/{qty})",
                    description=expense_in.description,
                    status=expense_in.status,
                    installment_current=i,
                    installment_total=qty,
                    tags=expense_in.tags,
                )
                saved = await self.repo.create(db_expense)
                created_expenses.append(saved)

        return created_expenses

    async def get_expense(self, user_id: uuid.UUID, expense_id: uuid.UUID) -> Expense:
        expense = await self.repo.get(expense_id, user_id=user_id)
        if not expense:
            raise ResourceNotFoundException("Expense")
        return expense

    async def list_expenses(
        self,
        user_id: uuid.UUID,
        start_date: Optional[datetime.date] = None,
        end_date: Optional[datetime.date] = None,
        expense_category_id: Optional[uuid.UUID] = None,
        status: Optional[ExpenseStatus] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Expense]:
        return await self.repo.get_by_date_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            expense_category_id=expense_category_id,
            status=status,
            skip=skip,
            limit=limit,
        )

    async def count_expenses(
        self,
        user_id: uuid.UUID,
        start_date: Optional[datetime.date] = None,
        end_date: Optional[datetime.date] = None,
        expense_category_id: Optional[uuid.UUID] = None,
        status: Optional[ExpenseStatus] = None,
    ) -> int:
        return await self.repo.count_by_date_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            expense_category_id=expense_category_id,
            status=status,
        )

    async def update_expense(
        self,
        user_id: uuid.UUID,
        expense_id: uuid.UUID,
        expense_up: ExpenseUpdate,
        update_type: str = "single",
    ) -> Expense:
        expense = await self.get_expense(user_id, expense_id)

        # Validate FKs if updated
        cat_id = expense_up.expense_category_id or expense.expense_category_id
        pay_id = expense_up.payment_method_id or expense.payment_method_id
        await self._validate_foreign_keys(user_id, cat_id, pay_id)

        update_dict = expense_up.model_dump(exclude_unset=True)

        if update_type == "single" or not expense.transaction_group_id:
            return await self.repo.update(expense, update_dict)

        # Handle subsequent or all updates for installments
        group_items = await self.repo.get_by_transaction_group(
            user_id, expense.transaction_group_id
        )

        for item in group_items:
            should_update = False
            if update_type == "all":
                should_update = True
            elif (
                update_type == "subsequent"
                and item.installment_current >= expense.installment_current
            ):
                should_update = True

            if should_update:
                item_update = update_dict.copy()
                # Make sure we don't overwrite names/dates of other installments if they include sequence markers
                if "name" in item_update and item_update["name"]:
                    # Keep the installment indicator (e.g. (2/3))
                    base_name = item_update["name"]
                    item_update["name"] = f"{base_name} ({item.installment_current}/{item.installment_total})"
                
                if "date" in item_update and item_update["date"]:
                    # Offset date based on difference in installment index
                    diff_months = item.installment_current - expense.installment_current
                    item_update["date"] = add_months(item_update["date"], diff_months)

                await self.repo.update(item, item_update)

        # Return the requested updated object
        await self.session.refresh(expense)
        return expense

    async def delete_expense(
        self, user_id: uuid.UUID, expense_id: uuid.UUID, delete_type: str = "single"
    ) -> None:
        expense = await self.get_expense(user_id, expense_id)

        if delete_type == "single" or not expense.transaction_group_id:
            await self.repo.soft_delete(expense)
            return

        group_items = await self.repo.get_by_transaction_group(
            user_id, expense.transaction_group_id
        )

        for item in group_items:
            should_delete = False
            if delete_type == "all":
                should_delete = True
            elif (
                delete_type == "subsequent"
                and item.installment_current >= expense.installment_current
            ):
                should_delete = True

            if should_delete:
                await self.repo.soft_delete(item)
