# Recaptcha plugin

The reCAPTCHA plugin for Userovo is designed to integrate Google's reCAPTCHA service into your Userovo analytics platform. This plugin helps protect your application from spam and abuse while ensuring a smooth user experience. It provides an easy-to-use API for managing reCAPTCHA verification and includes robust functionality for displaying reCAPTCHA challenges.

## File Structure

File structure follows usual Userovo plugin structure
```
recaptcha/
├── api/
│    └── api.js                               
├── frontend/
│    ├── public
│    │    ├── javascripts
│    │    │    ├── userovo.models.js           
│    │    │    └── userovo.views.js            
│    │    ├── localization                     # all localization files
│    │    └── stylesheets
│    └── app.js                                # reCAPTCHA integration for Userovo login
├── install.js
├── package.json
├── README.md
└── tests.js                                  # plugin tests
```

## Configuration

The reCAPTCHA plugin for Userovo requires a site key and a secret key from the Google reCAPTCHA admin console. Both keys are essential for the plugin to function correctly and ensure secure verification. In the recaptcha settings in Userovo, there is a link to the Google reCAPTCHA admin page.
