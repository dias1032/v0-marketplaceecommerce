// TODO_INTEGRATION: Import Supabase adapter when ready
// import supabaseAdapter from '../integrations/supabaseAdapter.js';

class AuthPage {
  constructor() {
    this.init()
  }

  init() {
    console.log("[v0] Initializing auth page")

    // Setup form handlers based on current page
    const loginForm = document.getElementById("login-form")
    const signupForm = document.getElementById("signup-form")
    const forgotPasswordForm = document.getElementById("forgot-password-form")

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e))
    }

    if (signupForm) {
      signupForm.addEventListener("submit", (e) => this.handleSignup(e))
    }

    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener("submit", (e) => this.handleForgotPassword(e))
    }

    console.log("[v0] Auth page initialized")
  }

  async handleLogin(e) {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const remember = document.getElementById("remember").checked

    console.log("[v0] Login attempt:", { email, remember })

    try {
      // TODO_INTEGRATION: Call Supabase auth
      // const { data, error } = await supabaseAdapter.signIn(email, password);
      // if (error) throw error;

      // Mock successful login
      const mockUser = {
        id: "user-123",
        email: email,
        name: "Usuário Teste",
        role: "customer",
        token: "mock-jwt-token",
      }

      // Save user to localStorage
      localStorage.setItem("marketplace_user", JSON.stringify(mockUser))

      // Show success message
      this.showSuccess("Login realizado com sucesso!")

      // Redirect after delay
      setTimeout(() => {
        const returnUrl = new URLSearchParams(window.location.search).get("return") || "/"
        window.location.href = returnUrl
      }, 1000)
    } catch (error) {
      console.error("[v0] Login error:", error)
      this.showError("E-mail ou senha incorretos. Tente novamente.")
    }
  }

  async handleSignup(e) {
    e.preventDefault()

    const name = document.getElementById("name").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirm-password").value
    const role = document.querySelector('input[name="role"]:checked').value
    const termsAccepted = document.getElementById("terms").checked

    // Validate passwords match
    if (password !== confirmPassword) {
      this.showError("As senhas não coincidem.")
      return
    }

    if (!termsAccepted) {
      this.showError("Você deve aceitar os termos de uso.")
      return
    }

    console.log("[v0] Signup attempt:", { name, email, role })

    try {
      // TODO_INTEGRATION: Call Supabase auth
      // const { data, error } = await supabaseAdapter.signUp({
      //   email,
      //   password,
      //   options: {
      //     data: { name, role }
      //   }
      // });
      // if (error) throw error;

      // Mock successful signup
      const mockUser = {
        id: "user-" + Date.now(),
        email: email,
        name: name,
        role: role,
        token: "mock-jwt-token",
      }

      // Save user to localStorage
      localStorage.setItem("marketplace_user", JSON.stringify(mockUser))

      // Show success message
      this.showSuccess("Conta criada com sucesso!")

      // Redirect based on role
      setTimeout(() => {
        if (role === "seller") {
          window.location.href = "/seller/dashboard.html"
        } else {
          window.location.href = "/"
        }
      }, 1000)
    } catch (error) {
      console.error("[v0] Signup error:", error)
      this.showError("Erro ao criar conta. Tente novamente.")
    }
  }

  async handleForgotPassword(e) {
    e.preventDefault()

    const email = document.getElementById("email").value

    console.log("[v0] Forgot password request:", { email })

    try {
      // TODO_INTEGRATION: Call Supabase password reset
      // const { error } = await supabaseAdapter.resetPassword(email);
      // if (error) throw error;

      // Hide form and show success message
      document.querySelector("form").style.display = "none"
      document.getElementById("success-message").style.display = "block"
    } catch (error) {
      console.error("[v0] Forgot password error:", error)
      this.showError("Erro ao enviar e-mail. Tente novamente.")
    }
  }

  showSuccess(message) {
    // Simple success notification
    const notification = document.createElement("div")
    notification.style.cssText = `
      position: fixed;
      top: calc(var(--header-height) + 1rem);
      right: 1rem;
      background: var(--color-success);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  showError(message) {
    // Simple error notification
    const notification = document.createElement("div")
    notification.style.cssText = `
      position: fixed;
      top: calc(var(--header-height) + 1rem);
      right: 1rem;
      background: var(--color-accent);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }
}

// Add animation styles
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`
document.head.appendChild(style)

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new AuthPage()
  })
} else {
  new AuthPage()
}
