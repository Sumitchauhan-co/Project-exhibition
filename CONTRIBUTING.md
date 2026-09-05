# 🤝 Contributing Guide

Welcome! Thank you for wanting to contribute to this project. To make collaboration smooth and conflict-free, please follow these steps to set up the repository locally, work on a separate branch, and submit your changes.

---

## 🚀 1. Clone & Setup Guide

Before doing anything, ensure you have the required tools installed on your computer:

- [Install Git](https://git-scm.com) (Required for version control)
- [Install Node.js & npm](https://npmjs.com) (Required for Frontend)
- [Install uv](https://astral.sh) (Required for Backend)

### Step 1: Clone the Repository

Open your terminal (or Command Prompt/Git Bash) and run the following command to clone this repository to your local machine:

```bash
git clone https://github.com/Sumitchauhan-co/Project-exhibition
```

### Step 2: Navigate to the Project Folder

Move into the project directory that was just created:

```bash
cd Project-exhibition
```

### Step 3: Setup Dependencies

Run the setup commands to install the required files for the project:

- **Frontend:**
  ```bash
  npm install
  ```
- **Backend:**
  ```bash
  uv sync
  ```

---

## 🌿 2. Working on a Separate Branch

**Rule #1:** Never commit directly to the `main` or `master` branch. Always create a new branch for your feature or bug fix.

### Step 1: Sync with Main

Before creating your branch, make sure your local copy has the latest code:

```bash
git checkout main
git pull origin main
```

### Step 2: Create and Switch to Your New Branch

Give your branch a descriptive name that explains what you are working on (e.g., `feature/add-login`, `bugfix/fix-header`, `edit/update-readme`).

Run this command to create and switch to your new branch automatically:

```bash
git checkout -b your-branch-name
```

---

## 💾 3. Making and Saving Changes

Go ahead and write your code or make your edits in your code editor. Once you are done, save your work to Git:

### Step 1: Check your changes

See which files you have modified:

```bash
git status
```

### Step 2: Stage the files

Add the files you want to commit. You can add specific files or add everything at once:

```bash
# Add all changed files
git add .
```

### Step 3: Commit your changes

Write a short, meaningful message explaining what you did:

```bash
git commit -m "Feat: Add login validation logic"
```

---

## 📤 4. Pushing Changes & Creating a Pull Request

Now it's time to upload your branch to GitHub so everyone else can see it.

### Step 1: Push the branch to GitHub

Run the following command to upload your branch:

```bash
git push -u origin your-branch-name
```

### Step 2: Open a Pull Request (PR)

1. Go to the main page of this repository on **GitHub**.
2. You will see a yellow banner at the top saying **"Compare & pull request"** for your recently pushed branch. Click it!
3. Add a clear title and description explaining what you changed.
4. Click **Create pull request**.

🎉 **You're done!** The project owner or your friends will review your code, leave feedback if needed, and merge it into the main project. Thank you for contributing!
