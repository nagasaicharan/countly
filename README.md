<p align="center">
  <img width="auto" src="https://cms.count.ly/uploads/userovo_github_56791635fe.png?updated_at=2023-04-05T09:56:43.491Z"/>
</p>

![CI](https://github.com/userovo/userovo-server/actions/workflows/main.yml/badge.svg)
![CodeQL Analysis](https://github.com/userovo/userovo-server/actions/workflows/codeql-analysis.yml/badge.svg)

## 🔗 Quick links

* [Userovo Website](https://userovo.com)
* [Userovo Server installation guide](https://support.userovo.com/hc/en-us/articles/360036862332-Installing-the-Userovo-Server)
* [Userovo SDKs, download and documentation links](https://support.userovo.com/hc/en-us/articles/360037236571-Downloading-and-Installing-SDKs)
* [Userovo Community on Discord](https://discord.gg/userovo)
* [User Guides for Userovo features](https://support.userovo.com/hc/en-us/sections/360007405211-User-Guides)

## 🌟 What is Userovo?

Userovo is a **privacy-first, AI-ready analytics and customer engagement platform** built for organizations that require **full data ownership and deployment flexibility**.

Unlike traditional SaaS-only analytics tools, Userovo can be deployed **on-premises or in a private cloud**, giving you complete control over your data, infrastructure, compliance, and security.

Teams use Userovo to:
* Understand user behavior across **mobile, web, desktop, and connected devices**
* Optimize product and customer experiences in **real time**
* Automate and personalize customer engagement across channels

With **flexible data tracking**, **customizable dashboards**, and a **modular plugin-based architecture**, Userovo scales with your product while ensuring long-term autonomy and zero vendor lock-in.

**Built for privacy. Designed for flexibility. Ready for AI-driven innovation.**

## 🚀 Userovo Plans                  

**Userovo Lite**
* Core analytics and essential features
* Free to use under an open-source, non-commercial license
* Self-hosted deployment
* Ideal for individuals and small teams

**Userovo Enterprise**
* Full analytics and engagement suite
* Advanced features, granular data access, SLA, and direct support
* Available as self-hosted or managed/private cloud
* Ideal for medium and large organizations with advanced compliance needs

**Userovo Flex**
* Fully managed SaaS experience with dedicated Userovo servers
* Region-based hosting selection
* Enterprise-grade features included, with optional add-ons
* Ideal for individuals and small-to-medium organizations wanting flexibility without infrastructure management

:pushpin: **Note**: Userovo SDKs are identical across all editions.

For a detailed comparison of different editions [please check here](https://userovo.com/pricing). To try the Userovo Flex [please visit this page]([https://userovo.com/flex](https://userovo.com/flex)).

## 📦 What is included in this repository?

This repository includes server-side part of Userovo, with the following features: 

* Session, view and event collection and reporting
* Crash/error reporting for iOS, Android, React Native, Flutter, NodeJS, Unity, Java and Javascript
* Rich and interactive push notifications for iOS and Android
* Remote configuration to adjust your app's logic, appearance, and behavior on the fly
* In-app ratings with customizable widgets
* Built in reports and customizable dashboards
* Email reports and alerts
* Hooks to send the data to external parties via email or webhooks
* Data Manager to plan and manage events and event segmentations
* Compliance Hub for consent collection and data subject request management
* User, application and permission management
* Read and write APIs
* Plugin based architecture for easy customization

![content](https://count.ly/github/userovo-highlights.png?v3)

## 📈 What can Userovo track?

Userovo can collect and visualize data from mobile, web and desktop applications. Using the write-API you can send data into Userovo from any source. For more information please check the below resources: 

* [List of Userovo SDKs, documentation and download information](https://support.userovo.com/hc/en-us/articles/360037236571-Downloading-and-Installing-SDKs)
* [SDK development guide to build your own SDK](https://support.userovo.com/hc/en-us/articles/360037753291-SDK-development-guide)
* [Userovo Server Write API to send data into Userovo from any source](https://api.count.ly/reference/i)

## 🛠️ Installing and upgrading Userovo server

Userovo installation script assumes it is running on a fresh Ubuntu/CentOS/RHEL Linux without any services listening on port 80 or 443 (which should also be open to incoming traffic), and takes care of every library and software required to be installed for Userovo to run.

There are several ways to install Userovo:

1. The following command will download and install Userovo on your **Ubuntu** or **CentOS** server.

   `wget -qO- https://c.ly/install | bash`

2. For bash lovers, we provide a beautiful installation script (`bin/userovo.install.sh`) in userovo-server package which installs everything required to run Userovo Server. For this, you need a stable release of this repository [available here](https://github.com/Userovo/userovo-server/releases).

3. Userovo Lite also has Docker support - [see our official Docker repository](https://registry.hub.docker.com/r/userovo/userovo-server/) and [installation instructions for Docker](https://support.userovo.com/hc/en-us/articles/360036862332-Installing-the-Userovo-Server).

If you want to upgrade Userovo from a previous version, please take a look at [upgrading documentation](https://support.userovo.com/hc/en-us/articles/360037443652-Upgrading-the-Userovo-Server).

## 💻 Running locally

These instructions are for running this repository directly on a local development machine.

Prerequisites:

* Node.js dependencies installed with `npm install`
* MongoDB running on `localhost:27017`
* Local database name: `userovo`

Start the API server:

```bash
node api/api.js
```

Start the dashboard server in another terminal:

```bash
node frontend/express/app.js
```

Open the dashboard:

```text
http://localhost:6001/login
```

The API runs at:

```text
http://localhost:3001
```

Local demo credentials:

```text
Email: admin@userovo.com
Password: Userovo@123
```

If the account does not exist in your local database, create it with:

```bash
node bin/commands/scripts/user_mgmt.js register admin@userovo.com Userovo@123
```

If the dashboard appears stale after branding or asset changes, hard refresh the browser with `Cmd + Shift + R` on macOS or `Ctrl + Shift + R` on Windows/Linux.

## 🧩 API, extensibility and plugins

Userovo has a [well-defined API](https://api.count.ly), that reads and writes data from/to the Userovo backend. Userovo dashboard is built using the read API, so it's possible to fetch any information you see on the dashboard using the API.

Userovo is extensible using the plugin architecture. If you would like to modify any exiting feature by extending it or changing it, or if you would like to add completely new capabilities to Userovo you can modify existing plugins or create new ones. We suggest [you read this document](https://support.userovo.com/hc/en-us/articles/360036862392-Introduction) if you would like to start with plugin development.

## 💚 Community

We have a new Discord Server (new as of Apr 2023) for our community 🎉 [Please join us](https://discord.gg/userovo) for any support requests, feature ideas, to showcase the application you are working on and for some occasional fun :)

## 🔒 Security

Security is very important to us. If you discover any issue regarding security, please disclose the information responsibly by sending an email to security@count.ly and **not by creating a GitHub issue**.

## 🏗️ Built with

* **MongoDB** — One of the most popular NoSQL databases
* **NodeJS** — An open-source, cross-platform JavaScript runtime environment
* **Linux** — What we all love using ;-)

Plus lots of [open source libraries](https://support.userovo.com/hc/en-us/articles/360037092232-Open-source-components)!         

## 📚 Developer Documentation

* [Coding Guidelines](CODING_GUIDELINES.md) — Development standards and best practices
* [Security Guidelines](docs/SECURITY.md) — Security requirements for contributions
* [Vue.js Guidelines](docs/VUEJS_GUIDELINES.md) — Frontend development patterns
* [CSS Style Guide](docs/CSS_STYLE_GUIDE.md) — SASS, BEM, and Bulma conventions
* [UI Testing Guide](docs/UI_TESTING.md) — Cypress testing and data-test-id usage
* [Test Suite Documentation](test/README.md) — Running and writing tests

## 🤝 How can I help you with your efforts?

1. Fork this repo
2. Create your feature branch (`git checkout -b my-new-super-feature`)
3. Commit your changes (`git commit -am 'Add some cool feature'`)
4. Push to the branch (`git push origin my-new-super-feature`)
5. Create a new pull request

Also, you are encouraged to read an extended contribution section on [how to contribute to Userovo](https://github.com/Userovo/userovo-server/blob/master/CONTRIBUTING.md).

## 👍 Badges

If you like Userovo, why not use one of our badges and give a link back to us?

<a href="https://userovo.com/?utm_source=badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/dark.svg?v2" alt="Userovo - Product Analytics" /></a>

    <a href="https://userovo.com/?utm_source=badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/dark.svg" alt="Userovo - Product Analytics" /></a>

<a href="https://userovo.com/?utm_source=badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/light.svg?v2" alt="Userovo - Product Analytics" /></a>

    <a href="https://userovo.com/?utm_source=badge" rel="nofollow"><img style="width:145px;height:60px" src="https://count.ly/badges/light.svg" alt="Userovo - Product Analytics" /></a>


## License
This project is licensed under **AGPL-3.0** with modified Section 7., see the [LICENSE](LICENSE) file for more details.

## 💚 Thanks

This project is tested with BrowserStack.
