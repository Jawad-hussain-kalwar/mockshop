# Page snapshot

```yaml
- text: Sign In Enter your credentials to access your account Email
- textbox "Email": admin@mockshop.com
- text: Password
- textbox "Password": password123
- button "Signing in..." [disabled]
- paragraph:
  - text: Don't have an account?
  - link "Sign up":
    - /url: /auth/signup
- region "Notifications alt+T"
- alert
```