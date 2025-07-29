# Git Workflow Guide

## Branch Strategy

We use a modified Git Flow strategy:

```
main (production)
  └── develop (integration)
       ├── feature/template-system
       ├── feature/advanced-reports
       ├── feature/csv-import
       └── hotfix/critical-bug
```

### Branch Types

1. **`main`** - Production-ready code
   - Protected branch (requires PR)
   - Triggers production deployment
   - Tagged for releases

2. **`develop`** - Integration branch
   - Protected branch (requires PR)
   - All features merge here first
   - Triggers staging deployment

3. **`feature/*`** - New features
   - Branch from: `develop`
   - Merge to: `develop`
   - Naming: `feature/short-description`

4. **`hotfix/*`** - Emergency fixes
   - Branch from: `main`
   - Merge to: `main` AND `develop`
   - Naming: `hotfix/issue-description`

5. **`release/*`** - Release preparation
   - Branch from: `develop`
   - Merge to: `main` AND `develop`
   - Naming: `release/v2.1.0`

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

### Examples
```bash
feat(expenses): add CSV import functionality
fix(dashboard): correct expense calculation
docs: update Docker setup guide
chore: update dependencies
```

## Workflow Examples

### 1. Starting a New Feature

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/template-system

# Work on feature
git add .
git commit -m "feat(templates): add template generation engine"

# Push to remote
git push -u origin feature/template-system

# Create Pull Request to develop
```

### 2. Creating a Hotfix

```bash
# Start from main
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/expense-calculation-error

# Fix the issue
git add .
git commit -m "fix(expenses): correct total calculation for deleted items"

# Push to remote
git push -u origin hotfix/expense-calculation-error

# Create PR to main
# After merge, also merge to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

### 3. Preparing a Release

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create release branch
git checkout -b release/v2.1.0

# Update version numbers
npm version minor  # in desktop/
# Update backend version

git add .
git commit -m "chore: bump version to 2.1.0"

# Run final tests
make test

# Merge to main
git checkout main
git merge --no-ff release/v2.1.0
git tag -a v2.1.0 -m "Release version 2.1.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v2.1.0
git push origin develop

# Delete release branch
git branch -d release/v2.1.0
```

## Pull Request Process

### 1. Before Creating PR

```bash
# Update from develop
git checkout develop
git pull origin develop
git checkout feature/your-feature
git merge develop

# Run tests
make test

# Run linting
make lint

# Check for security issues
make security
```

### 2. PR Requirements

- [ ] Tests pass
- [ ] Code is linted
- [ ] Documentation updated
- [ ] Commits follow conventions
- [ ] PR description filled out
- [ ] Linked to issue (if applicable)

### 3. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No new warnings

## Screenshots (if applicable)
Add screenshots for UI changes
```

## Git Commands Reference

### Useful Commands

```bash
# View branch graph
git log --graph --oneline --all

# Interactive rebase (squash commits)
git rebase -i HEAD~3

# Stash changes
git stash save "work in progress"
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Find who changed a line
git blame <file>

# Search commits
git log --grep="keyword"

# Clean up branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

### Aliases (add to ~/.gitconfig)

```ini
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    undo = reset --soft HEAD~1
    amend = commit --amend --no-edit
    wip = !git add -A && git commit -m "WIP"
    unwip = reset HEAD~1
```

## Troubleshooting

### Merge Conflicts

```bash
# Pull latest changes
git pull origin develop

# If conflicts occur
# Edit conflicted files
git add <resolved-files>
git commit

# Or abort merge
git merge --abort
```

### Accidentally Committed to Wrong Branch

```bash
# If not pushed yet
git reset --soft HEAD~1
git stash
git checkout correct-branch
git stash pop
git add .
git commit -m "your message"
```

### Need to Change Last Commit Message

```bash
# If not pushed
git commit --amend -m "new message"

# If pushed (avoid on shared branches)
git push --force-with-lease
```

## CI/CD Integration

Every push triggers:

1. **Feature branches**: Run tests only
2. **Develop branch**: Run tests, build, deploy to staging
3. **Main branch**: Run tests, build, security scan, deploy to production

See `.github/workflows/main.yml` for details.

## Best Practices

1. **Keep commits atomic** - One logical change per commit
2. **Write meaningful messages** - Future you will thank you
3. **Pull before push** - Always sync with remote
4. **Review your own PR** - Catch issues early
5. **Don't force push shared branches** - Use `--force-with-lease`
6. **Clean up branches** - Delete merged branches
7. **Tag releases** - Use semantic versioning

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)