
// Get form elements
const form = document.getElementById("registrationForm");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");
const password = document.getElementById("psw");
const confirmPassword = document.getElementById("confirmPassword");

// Get modal elements
const modal = document.getElementById("registrationSuccessModal");
const closeModal = document.getElementById("closeModal");


// Display error message
function showError(input, errorId, message) {
    input.classList.add("invalid");

    const errorElement = document.getElementById(errorId);
    errorElement.textContent = message;
    errorElement.style.display = "block";
}


// Clear error message
function clearError(input, errorId) {
    input.classList.remove("invalid");

    const errorElement = document.getElementById(errorId);
    errorElement.textContent = "";
    errorElement.style.display = "none";
}


// Clear all errors
function clearErrors() {
    clearError(firstName, "firstNameError");
    clearError(lastName, "lastNameError");
    clearError(email, "emailError");
    clearError(password, "passwordError");
    clearError(confirmPassword, "confirmPasswordError");
}


// Validate email
function validateEmail(emailValue) {
    return EMAIL_PATTERN.test(emailValue);
}


// Validate form
function validateForm() {
    clearErrors();

    let isValid = true;

    // First Name
    if (firstName.value.trim() === "") {
        showError(firstName, "firstNameError", "First Name is required.");
        isValid = false;
    }

    // Last Name
    if (lastName.value.trim() === "") {
        showError(lastName, "lastNameError", "Last Name is required.");
        isValid = false;
    }

    // Email
    if (email.value.trim() === "") {
        showError(email, "emailError", "Email is required.");
        isValid = false;
    } else if (!validateEmail(email.value.trim())) {
        showError(email, "emailError", "Please enter a valid email address.");
        isValid = false;
    }

    // Password
    if (password.value.length < 8) {
        showError(password, "passwordError", "Password must contain at least 8 characters.");
        isValid = false;
    }

    // Confirm Password
    if (confirmPassword.value === "") {
        showError(confirmPassword, "confirmPasswordError", "Please confirm your password.");
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, "confirmPasswordError", "Passwords do not match.");
        isValid = false;
    }

    return isValid;
}


// Open account-created modal
function openRegistrationSuccessModal() {
    modal.classList.add("active");
}


// Close account-created modal
function closeRegistrationModal() {
    modal.classList.remove("active");
}


// Handle form submission

form.addEventListener("submit", function(event) {
    // Не дозволяємо браузеру перезавантажити сторінку
    event.preventDefault();

    // Спочатку перевіряємо правильність заповнення форми
    if (!validateForm()) {
        return;
    }

    // Реєструємо нового користувача
    const result = registerUser(
        firstName.value.trim(),
        lastName.value.trim(),
        email.value.trim(),
        password.value
    );

    // Якщо email вже зареєстрований
    if (!result.success) {
        showError(email, "emailError", result.message);
        return;
    }

    // Автоматично авторизуємо нового користувача
    const loginResult = loginUser(email.value.trim(), password.value);

    if (!loginResult.success) {
        showError(
            password,
            "passwordError",
            "Your account was created, but automatic sign-in failed. Please log in."
        );
        return;
    }

    // Показуємо підтвердження створення акаунта
    openRegistrationSuccessModal();
});



// Close modal using button
closeModal.addEventListener("click", closeRegistrationModal);


// Close modal by clicking outside the window
modal.addEventListener("click", function(event) {
    if (event.target === modal) {
        closeRegistrationModal();
    }
});


// Close modal using Escape key
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && modal.classList.contains("active")) {
        closeRegistrationModal();
    }
});
