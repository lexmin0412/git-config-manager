# Changesets

Hello and welcome! This repo has been configured to use changesets. This folder is used to hold the changeset markdown files that describe the changes that have been made.

## What are changesets?

Changesets are a way to manage versioning and changelogs for your packages. They allow you to describe your changes in a markdown file, and then use the changesets CLI to version and publish your packages.

## How do I add a changeset?

1. Run `npx changeset` from the root of the repo
2. Select the packages that have changed
3. Choose the appropriate bump type (major, minor, patch)
4. Write a summary of the changes
5. A new markdown file will be created in the `.changesets` directory

## How do I version and publish?

1. Run `npx changeset version` to consume changesets and update package versions
2. Run `npx changeset publish` to publish the updated packages to npm
