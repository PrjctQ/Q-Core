# Contributor Guidelines for Q-Core

Thank you for your interest in contributing to Q-Core! We are a community-driven project and appreciate all contributions, from bug reports and feature suggestions to code changes and documentation improvements.

These guidelines are designed to make the contribution process easy and effective for everyone involved.

## Table of Contents

1.  [Code of Conduct](#code-of-conduct)
2.  [How Can I Contribute?](#how-can-i-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Your First Code Contribution](#your-first-code-contribution)
    - [Improving Documentation](#improving-documentation)
3.  [Development Process](#development-process)
    - [Setting Up the Development Environment](#setting-up-the-development-environment)
    - [Pull Request Process](#pull-request-process)
4.  [Style Guides](#style-guides)
    - [Git Commit Messages](#git-commit-messages)
    - [Code Style](#code-style)
    - [Documentation Style](#documentation-style)
5.  [Community](#community)

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. By participating in this project, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before interacting with the community.

## How Can I Contribute?

### Reporting Bugs

Bugs are tracked as [GitHub Issues](https://github.com/PrjctQ/Q-Core/issues). Before creating a bug report, please check the existing issues to avoid duplicates.

**How to submit a good bug report:**

- **Use a clear and descriptive title.**
- **Describe the exact steps to reproduce the problem.** Be as detailed as possible.
- **Describe the behavior you observed** after following the steps.
- **Describe the behavior you expected to see** instead.
- **Include any relevant logs, screenshots, or error messages.**
- **Specify your environment:** OS, version of Q-Core, version of dependencies, etc.

### Suggesting Enhancements

We welcome ideas for new features and improvements. Please use the "Feature request" template in our issue tracker.

**How to submit a good enhancement suggestion:**

- **Use a clear and descriptive title.**
- **Provide a detailed description of the proposed feature.**
- **Explain why this enhancement would be useful** to most users of Q-Core.
- **List any alternative solutions or features** you've considered.
- (Optional) **Include mockups, sketches, or examples** if applicable.

### Your First Code Contribution

Unsure where to begin? You can start by looking at issues labeled `good first issue` or `help wanted`.

### Improving Documentation

Documentation is crucial! You can help by:

- Fixing typos and clarifying confusing explanations.
- Adding missing documentation for functions, classes, or APIs.
- Improving the structure or translation of documentation.
- Writing tutorials or examples.

## Development Process

### Setting Up the Development Environment

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/PrjctQ/Q-Core.git
    cd Q-Core
    ```
3.  **Add the original repo as an upstream remote** (to sync changes):
    ```bash
    git remote add upstream https://github.com/PrjctQ/Q-Core.git
    ```
4.  **Install dependencies:**
    ```bash
    npm install
    ```
5.  **Run tests** to ensure everything works:
    ```bash
    npm test
    ```

### Pull Request Process

1.  **Sync your fork:** Before you start, make sure your fork is up-to-date with the `main` branch.
    ```bash
    git fetch upstream
    git checkout main
    git merge upstream/main
    ```
2.  **Create a feature branch:** Never work directly on the `main` branch.
    ```bash
    git checkout -b feat/your-feature-name
    # or
    git checkout -b fix/issue-number-short-description
    ```
3.  **Make your changes:** Follow the [style guides](#style-guides) below.
4.  **Write or update tests** to cover your changes.
5.  **Run the test suite** to ensure all tests still pass.
6.  **Commit your changes:** Use a descriptive commit message (see guidelines below).
7.  **Push to your fork:** `git push origin your-branch-name`
8.  **Submit a Pull Request (PR)** from your branch to the `main` branch of the original repository.
    - **Fill out the PR template** completely.
    - **Link any related issues** by writing `Closes #123` or `Fixes #456` in the PR description.
    - **Do not force push** after submitting your PR, as it makes review difficult. We will squash commits on merge.

**Review Process:**

- A maintainer will review your PR and may request changes.
- Once approved, a maintainer will merge your PR.

## Style Guides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or less.
- Reference issues and pull requests liberally after the first line.
- Consider following the [Conventional Commits](https://www.conventionalcommits.org/) specification (e.g., `feat: add new API endpoint`, `fix: resolve parsing bug`).

### Code Style

We enforce consistency using linters and formatters. Please run these before committing.

- **JavaScript/TypeScript:** Please run `eslint` and `prettier`.
- **Python:** Please format code with `black` and check with `flake8`.
- **Ruby:** Please follow `standardrb` guidelines.
- **General:** Comment your code, especially for complex logic.

_Run the linter: `npm run lint`_

### Documentation Style

- Use clear, simple language.
- Update documentation for any change in functionality.
- For API docs, follow the existing JSDoc/JavaDoc/etc., style.

## Community

The core team can be reached at:

- **Discussions:** [Github Community](https://github.com/orgs/PrjctQ/discussions)
- **Chat:** [Discord](https://discord.gg/sm9e48ZU)
