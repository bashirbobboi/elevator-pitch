# 🤝 Contributing to Elevator Pitch Platform

Thank you for your interest in contributing to the Elevator Pitch Platform! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please read and follow our Code of Conduct:

- **Be respectful** and inclusive in all interactions
- **Be constructive** in feedback and discussions
- **Be patient** with newcomers and different skill levels
- **Be collaborative** and help others learn and grow

### Unacceptable Behavior

- Harassment, trolling, or inappropriate comments
- Personal attacks or discriminatory language
- Spam or off-topic discussions
- Any behavior that makes others feel unwelcome

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local or cloud instance)
- **Git** for version control
- **Modern web browser** for testing

### Quick Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/elevator-pitch.git
   cd elevator-pitch
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/elevator-pitch.git
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

---

## 🛠️ Development Setup

### Environment Configuration

1. **Backend Environment**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/elevator-pitch
   NODE_ENV=development
   ```

2. **Frontend Environment**
   ```bash
   cd frontend
   # No additional environment setup required for development
   ```

### Database Setup

1. **Install MongoDB**
   - [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Or use [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database

2. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Compass for GUI
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:5001
   ```

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001
   - API Documentation: http://localhost:5001/api

---

## 📝 Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

#### 🐛 **Bug Fixes**
- Fix existing issues and bugs
- Improve error handling
- Optimize performance

#### ✨ **New Features**
- Add new functionality
- Enhance existing features
- Improve user experience

#### 📚 **Documentation**
- Update README files
- Add code comments
- Create tutorials or guides

#### 🎨 **UI/UX Improvements**
- Design enhancements
- Responsive improvements
- Accessibility features

#### 🧪 **Testing**
- Add unit tests
- Integration tests
- End-to-end tests

### Contribution Process

1. **Check Existing Issues**
   - Look for open issues that match your interests
   - Comment on issues you'd like to work on
   - Ask questions if you need clarification

2. **Create a New Issue** (if needed)
   - Use the issue template
   - Provide clear description
   - Include steps to reproduce (for bugs)

3. **Fork and Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

4. **Make Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

5. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend
   npm test
   
   # Frontend tests
   cd frontend
   npm test
   ```

6. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

7. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] **Code follows style guidelines**
- [ ] **Self-review completed**
- [ ] **Tests added/updated**
- [ ] **Documentation updated**
- [ ] **No breaking changes** (or clearly documented)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs
   - Code quality checks
   - Test coverage analysis

2. **Maintainer Review**
   - Code review by maintainers
   - Feedback and suggestions
   - Approval or requested changes

3. **Merge**
   - Squash and merge (preferred)
   - Delete feature branch
   - Update version if needed

---

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the Bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari, Firefox]
- Version: [e.g. 22]

**Additional Context**
Any other context about the problem.
```

### Feature Requests

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

---

## 🔄 Development Workflow

### Git Workflow

1. **Main Branch**: `main` (production-ready)
2. **Development Branch**: `develop` (integration branch)
3. **Feature Branches**: `feature/description`
4. **Bug Fix Branches**: `fix/description`
5. **Hotfix Branches**: `hotfix/description`

### Branch Naming Convention

```bash
# Features
feature/add-teleprompter-controls
feature/analytics-dashboard

# Bug fixes
fix/video-playback-issue
fix/upload-error-handling

# Hotfixes
hotfix/security-patch
hotfix/critical-bug

# Documentation
docs/update-readme
docs/api-documentation
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat: add teleprompter speed controls
fix: resolve video playback error
docs: update installation instructions
style: format code with prettier
```

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test
npm run test:watch
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:watch
npm run test:coverage
```

### Test Guidelines

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user workflows
- **Coverage**: Aim for >80% code coverage

### Writing Tests

```javascript
// Example unit test
describe('VideoController', () => {
  it('should increment view count', async () => {
    const video = await Video.create({ title: 'Test Video' });
    const result = await incrementViewCount(video._id);
    expect(result.viewCount).toBe(1);
  });
});
```

---

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for functions and classes
- **Inline comments** for complex logic
- **README updates** for new features
- **API documentation** for endpoints

### Documentation Standards

```javascript
/**
 * Creates a new elevator pitch video
 * @param {Object} videoData - Video information
 * @param {string} videoData.title - Video title
 * @param {string} videoData.videoUrl - Video file URL
 * @param {string} videoData.shareId - Unique share identifier
 * @returns {Promise<Object>} Created video object
 */
async function createVideo(videoData) {
  // Implementation
}
```

---

## 🎯 Areas for Contribution

### High Priority

- **Performance Optimization**: Improve video loading and playback
- **Mobile Responsiveness**: Enhance mobile user experience
- **Accessibility**: Improve screen reader support
- **Testing**: Increase test coverage
- **Documentation**: Improve API documentation

### Medium Priority

- **New Features**: Additional analytics, export options
- **UI Improvements**: Better animations, transitions
- **Security**: Enhanced file upload security
- **Internationalization**: Multi-language support

### Low Priority

- **Code Refactoring**: Improve code organization
- **Dependencies**: Update and optimize packages
- **Monitoring**: Add application monitoring
- **Deployment**: Improve deployment process

---

## 🏆 Recognition

### Contributors

We recognize all contributors in our project:

- **Code Contributors**: Listed in CONTRIBUTORS.md
- **Documentation**: Recognized in README
- **Bug Reports**: Acknowledged in issues
- **Feature Ideas**: Credited in feature descriptions

### Contribution Levels

- **🥉 Bronze**: 1-5 contributions
- **🥈 Silver**: 6-15 contributions  
- **🥇 Gold**: 16+ contributions
- **💎 Diamond**: Major feature contributions

---

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: [your-email@example.com](mailto:your-email@example.com)

### Response Times

- **Critical Issues**: Within 24 hours
- **Bug Reports**: Within 3-5 days
- **Feature Requests**: Within 1-2 weeks
- **General Questions**: Within 1 week

---

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## 🙏 Thank You

Thank you for considering contributing to the Elevator Pitch Platform! Your contributions help make this project better for everyone.

**Happy Coding! 🚀**

---

<div align="center">

**Questions?** Open an issue or start a discussion!

[![GitHub Issues](https://img.shields.io/github/issues/bashirbobboi/elevator-pitch)](https://github.com/bashirbobboi/elevator-pitch/issues)
[![GitHub Discussions](https://img.shields.io/github/discussions/bashirbobboi/elevator-pitch)](https://github.com/bashirbobboi/elevator-pitch/discussions)

</div>
