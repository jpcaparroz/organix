from fastapi import HTTPException, status


class DomainException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class CredentialsException(DomainException):
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status_code.HTTP_401_UNAUTHORIZED,
            detail=detail,
        )


class PermissionDeniedException(DomainException):
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class ResourceNotFoundException(DomainException):
    def __init__(self, resource_name: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_name} not found",
        )


class UserAlreadyExistsException(DomainException):
    def __init__(self, email: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email {email} already exists",
        )


class ValidationError(DomainException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )
