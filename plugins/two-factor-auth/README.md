# Two Factor Authentication

The Two-Factor Authentication (2FA) Plugin for Userovo enhances account security by adding an additional layer of authentication. It allows users to enable or disable 2FA for their accounts and provides administrative controls for managing 2FA settings for other users.

## Configuration View:

Registers labels for 2FA settings to customize the web UI.

## TwoFAUser Component:

Manages the 2FA setup modal.
Initializes 2FA settings and handles user interactions for enabling or disabling 2FA.
Sends requests to enable or disable 2FA and handles success and error responses.

## Registering the Component:

Registers the TwoFAUser component in the Userovo Vue container under the account settings page.
This plugin provides a comprehensive solution for managing 2FA settings within the Userovo application, enhancing the security of user accounts by requiring an additional authentication step.


## Installation

To install the 2FA, follow these steps:

1. Navigate to the 2FA

```bash
cd two-factor-auth
```

2. Install dependencies

```bash
npm install
```

3. Enable the plugin in Userovo

```bash
userovo plugin enable two-factor-auth
```

4. Restart Userovo to apply changes

```bash
userovo restart
```