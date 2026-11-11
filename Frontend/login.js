const form = document.getElementById("registrationForm");
const email = document.getElementById("email");
const password = document.getElementById("psw");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const modal = document.getElementById("verificationModal");

function clearErrors() {
    email.classList.remove("invalid");
    password.classList.remove("invalid");
    emailError.textContent = "";
    passwordError.textContent = "";
    emailError.style.display = "none";
    passwordError.style.display = "none";
}

function showError(input, errorElement, message) {
    input.classList.add("invalid");
    errorElement.textContent = message;
    errorElement.style.display = "block";
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    let isValid = true;
    const emailValue = email.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        showError(email, emailError, "Please enter a valid email address.");
        isValid = false;
    }

    if (!password.value) {
        showError(password, passwordError, "Please enter your password.");
        isValid = false;
    }

    if (!isValid) return;

    modal.classList.add("active");
});

function hideModal() {
    modal.classList.remove("active");
}

modal.addEventListener("click", (event) => {
    if (event.target === modal) hideModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("active")) {
        hideModal();
    }
});