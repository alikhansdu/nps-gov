from passlib.context import CryptContext

# Настроим контекст так же, как в проекте
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Пароль, который хочешь захэшировать
plain_password = "123456"

# Генерация хэша
hashed_password = pwd_context.hash(plain_password)

print("Хэш пароля:", hashed_password)