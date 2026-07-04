from typing import Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import UserAlreadyExistsException, CredentialsException, ResourceNotFoundException
from app.core.security import hash_password, verify_password
from app.models.users import User
from app.repositories.user import UserRepository
from app.schemas.users import UserCreate, UserUpdate


class UserService:
    def __init__(self, session: AsyncSession):
        self.repo = UserRepository(session)

    async def authenticate(self, email: str, password: str) -> User:
        email_lower = email.lower().strip()
        user = await self.repo.get_by_email(email_lower)
        if not user or not verify_password(password, user.password_hash):
            raise CredentialsException("Incorrect email or password")
        if not user.is_active:
            raise CredentialsException("Inactive user")
        return user

    async def create_user(self, user_create: UserCreate) -> User:
        email_lower = user_create.email.lower().strip()
        existing_user = await self.repo.get_by_email(email_lower)
        if existing_user:
            raise UserAlreadyExistsException(email_lower)

        db_user = User(
            email=email_lower,
            password_hash=hash_password(user_create.password),
            name=user_create.name,
            icon=user_create.icon,
        )
        user = await self.repo.create(db_user)

        # Seed defaults
        await self._seed_user_defaults(user.user_id)

        return user

    async def _seed_user_defaults(self, user_id: uuid.UUID):
        from app.models.expense_categories import ExpenseCategory
        from app.models.income_categories import IncomeCategory
        from app.models.payment_methods import PaymentMethod, PaymentMethodType
        from app.repositories.expense_category import ExpenseCategoryRepository
        from app.repositories.income_category import IncomeCategoryRepository
        from app.repositories.payment_method import PaymentMethodRepository

        expense_cat_repo = ExpenseCategoryRepository(self.repo.session)
        income_cat_repo = IncomeCategoryRepository(self.repo.session)
        pm_repo = PaymentMethodRepository(self.repo.session)

        # Default Expense Categories
        default_expenses = [
            ("Food", "#ba1a1a", "restaurant"),
            ("Transport", "#00668b", "directions_car"),
            ("Housing", "#4d606c", "home"),
            ("Entertainment", "#5d5b7d", "sports_esports"),
            ("Health", "#805600", "medical_services"),
        ]
        for name, color, icon in default_expenses:
            await expense_cat_repo.create(
                ExpenseCategory(
                    user_id=user_id,
                    name=name,
                    color_hex=color,
                    icon=icon,
                )
            )

        # Default Income Categories
        default_incomes = [
            ("Salary", "#006e33", "payments"),
            ("Freelance", "#4c6b5b", "work"),
        ]
        for name, color, icon in default_incomes:
            await income_cat_repo.create(
                IncomeCategory(
                    user_id=user_id,
                    name=name,
                    color_hex=color,
                    icon=icon,
                )
            )

        # Default Payment Methods
        default_pms = [
            ("Cash", PaymentMethodType.CASH, "monetization_on"),
            ("Credit Card", PaymentMethodType.CREDIT_CARD, "credit_card"),
            ("Bank Account", PaymentMethodType.BANK_TRANSFER, "account_balance"),
            ("Pix", PaymentMethodType.PIX, "pix"),
        ]
        for name, pm_type, icon in default_pms:
            await pm_repo.create(
                PaymentMethod(
                    user_id=user_id,
                    name=name,
                    type=pm_type,
                    icon=icon,
                )
            )

    async def get_user(self, user_id: uuid.UUID) -> User:
        user = await self.repo.get(user_id)
        if not user:
            raise ResourceNotFoundException("User")
        return user

    async def update_user(self, user_id: uuid.UUID, user_update: UserUpdate) -> User:
        user = await self.get_user(user_id)
        
        update_data = user_update.model_dump(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            update_data["password_hash"] = hash_password(update_data.pop("password"))
        elif "password" in update_data:
            update_data.pop("password")
            
        if "email" in update_data:
            email_lower = update_data["email"].lower().strip()
            update_data["email"] = email_lower
            existing = await self.repo.get_by_email(email_lower)
            if existing and existing.user_id != user_id:
                raise UserAlreadyExistsException(email_lower)
                
        return await self.repo.update(user, update_data)
