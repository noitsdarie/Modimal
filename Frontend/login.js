
const form = document.getElementById("registrationForm");

const email = document.getElementById("email");
const password = document.getElementById("psw");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const modal = document.getElementById("verificationModal");
const passwordResetButton = document.getElementById("passwordResetButton");
const passwordResetNotice = document.getElementById("passwordResetNotice");

// Очищуємо всі помилки
function clearErrors() {
    email.classList.remove("invalid");
    password.classList.remove("invalid");

    emailError.textContent = "";
    passwordError.textContent = "";

    emailError.style.display = "none";
    passwordError.style.display = "none";
}

// Показуємо помилку
function showError(input, errorElement, message) {
    input.classList.add("invalid");

    errorElement.textContent = message;
    errorElement.style.display = "block";
}

passwordResetButton.addEventListener("click", () => {
    passwordResetNotice.textContent = "Password reset is unavailable in this demo.";
    passwordResetNotice.hidden = false;
});

// Перевіряємо правильність заповнення форми
function validateLoginForm() {
    clearErrors();

    let isValid = true;

    const emailValue = email.value.trim();

    if (emailValue === "") {
        showError(
            email,
            emailError,
            "Email is required."
        );

        isValid = false;

    } else if (!EMAIL_PATTERN.test(emailValue)) {
        showError(
            email,
            emailError,
            "Please enter a valid email address."
        );

        isValid = false;
    }

    if (password.value === "") {
        showError(
            password,
            passwordError,
            "Please enter your password."
        );

        isValid = false;
    }

    return isValid;
}

// Обробляємо натискання кнопки Log In
form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateLoginForm()) {
        return;
    }

    // Перевіряємо email та пароль
    const result = loginUser(
        email.value.trim(),
        password.value
    );

    // Якщо дані неправильні
    if (!result.success) {
        showError(
            password,
            passwordError,
            result.message
        );

        return;
    }

    // Якщо авторизація успішна
    modal.classList.add("active");
});

// Закриваємо модальне вікно
function hideModal() {
    modal.classList.remove("active");
}

// Закриваємо при натисканні поза модальним вікном
modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        hideModal();
    }
});

// Закриваємо при натисканні Escape
document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        modal.classList.contains("active")
    ) {
        hideModal();
    }
});
