
(function () {
    // Елементи модального вікна
    const modal = document.getElementById("socialAuthModal");
    const closeButton = document.getElementById("socialAuthClose");

    const logo = document.getElementById("socialAuthLogo");
    const title = document.getElementById("socialAuthTitle");
    const description = document.getElementById("socialAuthDescription");

    const accountsContainer = document.getElementById("socialDemoAccounts");
    const form = document.getElementById("socialAuthForm");
    const successMessage = document.getElementById("socialAuthSuccessMessage");
    const successPanel = document.getElementById("socialAuthSuccess");
    const continueButton = document.getElementById("socialAuthContinue");
    const modalContent = modal.querySelector(".social-auth-modal");

    const firstNameInput = document.getElementById("socialFirstName");
    const lastNameInput = document.getElementById("socialLastName");
    const emailInput = document.getElementById("socialEmail");

    const firstNameError = document.getElementById("socialFirstNameError");
    const lastNameError = document.getElementById("socialLastNameError");
    const emailError = document.getElementById("socialEmailError");

    let currentProvider = "";
    let previousFocus = null;
    let previousBodyOverflow = "";

    // Демонстраційні профілі
    const demoAccounts = {
        google: [
            {
                firstName: "Daria",
                lastName: "Google",
                email: "daria@gmail.com"
            },
            {
                firstName: "Alex",
                lastName: "Morgan",
                email: "alex.morgan@gmail.com"
            }
        ],

        facebook: [
            {
                firstName: "Daria",
                lastName: "Facebook",
                email: "daria.facebook@example.com"
            },
            {
                firstName: "Chris",
                lastName: "Taylor",
                email: "chris.taylor@example.com"
            }
        ],

        apple: [
            {
                firstName: "Daria",
                lastName: "Apple",
                email: "daria@icloud.com"
            },
            {
                firstName: "Jamie",
                lastName: "Wilson",
                email: "jamie.wilson@icloud.com"
            }
        ]
    };

    // Налаштування провайдерів
    const providers = {
        google: {
            name: "Google",
            logo: "G"
        },
        facebook: {
            name: "Facebook",
            logo: "f"
        },
        apple: {
            name: "Apple",
            logo: ""
        }
    };

    // Відкриваємо модальне вікно
    function openSocialModal(provider) {
        if (!Object.prototype.hasOwnProperty.call(providers, provider)) {
            return;
        }

        currentProvider = provider;

        const providerInfo = providers[provider];

        modalContent.dataset.provider = provider;
        logo.textContent = providerInfo.logo;
        title.textContent = `Continue with ${providerInfo.name}`;
        description.textContent =
            `Choose a demo ${providerInfo.name} profile or create one for this preview.`;

        renderDemoAccounts(provider);

        form.reset();
        clearErrors();

        successPanel.hidden = true;
        modalContent.classList.remove("is-success");

        previousFocus = document.activeElement;
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        modal.classList.add("active");
        closeButton.focus();
    }

    // Відображаємо тестові акаунти
    function renderDemoAccounts(provider) {
        accountsContainer.innerHTML = "";

        demoAccounts[provider].forEach(account => {
            const button = document.createElement("button");

            button.type = "button";
            button.classList.add("social-demo-account");

            const initials = `${account.firstName[0]}${account.lastName[0]}`;

            button.innerHTML = `
                <span class="social-demo-avatar">${initials}</span>

                <span class="social-demo-account-info">
                    <strong>${account.firstName} ${account.lastName}</strong>
                    <span>${account.email}</span>
                </span>
            `;
            button.setAttribute(
                "aria-label",
                `Continue as ${account.firstName} ${account.lastName}, ${account.email}`
            );

            button.addEventListener("click", () => {
                authenticateSocialUser(account);
            });

            accountsContainer.appendChild(button);
        });
    }

    // Авторизуємо користувача
    function authenticateSocialUser(profile) {
        const users = getUsers();

        const normalizedEmail = normalizeEmail(profile.email);

        let user = users.find(user =>
            normalizeEmail(user.email) === normalizedEmail
        );

        // Якщо користувача ще немає — створюємо його
        if (!user) {
            user = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: normalizedEmail,
                password: null,
                provider: currentProvider
            };

            users.push(user);
            saveUsers(users);
        }

        // Створюємо активну сесію
        const currentUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            provider: currentProvider
        };

        localStorage.setItem(
            "modimalCurrentUser",
            JSON.stringify(currentUser)
        );

        showSuccess(currentUser);
    }

    // Показуємо успішну авторизацію
    function showSuccess(user) {
        modalContent.classList.add("is-success");
        title.textContent = `Welcome, ${user.firstName}!`;
        description.textContent =
            "Your demo profile is signed in on this device.";
        logo.textContent = "✓";
        successMessage.textContent = `Signed in as ${user.email}. No data was sent to an external provider.`;
        successPanel.hidden = false;
        continueButton.focus();
    }

    // Перевіряємо введені користувачем дані
    function validateSocialForm() {
        clearErrors();

        let isValid = true;

        if (!firstNameInput.value.trim()) {
            firstNameError.textContent = "First name is required.";
            firstNameError.style.display = "block";
            firstNameInput.setAttribute("aria-invalid", "true");
            isValid = false;
        }

        if (!lastNameInput.value.trim()) {
            lastNameError.textContent = "Last name is required.";
            lastNameError.style.display = "block";
            lastNameInput.setAttribute("aria-invalid", "true");
            isValid = false;
        }

        const email = emailInput.value.trim();

        if (!email) {
            emailError.textContent = "Email is required.";
            emailError.style.display = "block";
            emailInput.setAttribute("aria-invalid", "true");
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailError.textContent = "Please enter a valid email.";
            emailError.style.display = "block";
            emailInput.setAttribute("aria-invalid", "true");
            isValid = false;
        }

        return isValid;
    }

    // Очищуємо помилки
    function clearErrors() {
        [
            [firstNameInput, firstNameError],
            [lastNameInput, lastNameError],
            [emailInput, emailError]
        ].forEach(([input, error]) => {
            input.removeAttribute("aria-invalid");
            error.textContent = "";
            error.style.display = "none";
        });
    }

    // Обробляємо кнопки соціальної авторизації
    document.querySelectorAll(".social-login-button").forEach(button => {
        button.addEventListener("click", () => {
            const provider = button.dataset.provider;

            openSocialModal(provider);
        });
    });

    // Обробляємо власні демонстраційні дані
    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!validateSocialForm()) {
            return;
        }

        const profile = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim()
        };

        authenticateSocialUser(profile);
    });

    // Закриваємо модальне вікно
    function closeSocialModal() {
        modal.classList.remove("active");
        document.body.style.overflow = previousBodyOverflow;
        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }
    }

    closeButton.addEventListener("click", closeSocialModal);
    continueButton.addEventListener("click", closeSocialModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeSocialModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            modal.classList.contains("active")
        ) {
            closeSocialModal();
        }
    });
})();
