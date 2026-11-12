
// auth.js

const DEMO_USER = {
    firstName: "Demo",
    lastName: "User",
    email: "demo@modimal.com",
    password: "Modimal123"
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

// Отримуємо всіх зареєстрованих користувачів
function getUsers() {
    return JSON.parse(localStorage.getItem("modimalUsers")) || [];
}

// Зберігаємо користувачів
function saveUsers(users) {
    localStorage.setItem("modimalUsers", JSON.stringify(users));
}

// Додаємо тестового користувача, якщо його ще немає
function createDemoUser() {
    const users = getUsers();

    const demoExists = users.some(user =>
        normalizeEmail(user.email) === DEMO_USER.email
    );

    if (!demoExists) {
        users.push(DEMO_USER);
        saveUsers(users);
    }
}

// Реєстрація нового користувача
function registerUser(firstName, lastName, email, password) {
    const normalizedFirstName = typeof firstName === "string" ? firstName.trim() : "";
    const normalizedLastName = typeof lastName === "string" ? lastName.trim() : "";
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedFirstName || !normalizedLastName) {
        return {
            success: false,
            message: "First and last name are required."
        };
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
        return {
            success: false,
            message: "Please enter a valid email address."
        };
    }

    if (typeof password !== "string" || password.length < 8) {
        return {
            success: false,
            message: "Password must contain at least 8 characters."
        };
    }

    const users = getUsers();

    const userExists = users.some(user =>
        normalizeEmail(user.email) === normalizedEmail
    );

    if (userExists) {
        return {
            success: false,
            message: "An account with this email already exists."
        };
    }

    const newUser = {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        email: normalizedEmail,
        password: password
    };

    users.push(newUser);
    saveUsers(users);

    return {
        success: true,
        user: newUser
    };
}

// Вхід у систему
function loginUser(email, password) {
    const users = getUsers();

    const normalizedEmail = normalizeEmail(email);

    const user = users.find(user =>
        normalizeEmail(user.email) === normalizedEmail &&
        user.password === password
    );

    if (!user) {
        return {
            success: false,
            message: "Incorrect email or password."
        };
    }

    // Зберігаємо інформацію про поточну сесію
    const currentUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    };

    localStorage.setItem(
        "modimalCurrentUser",
        JSON.stringify(currentUser)
    );

    return {
        success: true,
        user: currentUser
    };
}

// Отримуємо поточного користувача
function getCurrentUser() {
    return JSON.parse(
        localStorage.getItem("modimalCurrentUser")
    );
}

// Вихід з акаунта
function logoutUser() {
    localStorage.removeItem("modimalCurrentUser");
}

// Створюємо тестовий акаунт
createDemoUser();
