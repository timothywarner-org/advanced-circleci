# Globomantics Robot Fleet Orb

A custom CircleCI orb for the Globomantics Robot Fleet API project. This orb demonstrates how to create, test, and publish your own CircleCI orbs.

## Overview

This orb provides reusable configuration for the Robot Fleet API CI/CD pipeline:

- **Executors**: Pre-configured Node.js environments
- **Commands**: Health checks, deployment validation, notifications
- **Jobs**: Ready-to-use jobs for build, test, and deploy workflows

## Installation

```yaml
version: 2.1

orbs:
  robot-fleet: globomantics/robot-fleet@1.0.0

workflows:
  build-test:
    jobs:
      - robot-fleet/build
      - robot-fleet/test:
          requires:
            - robot-fleet/build
```

## Components

### Executors

| Executor | Description |
|----------|-------------|
| `default` | Node.js 20 executor optimized for Robot Fleet projects |
| `with-docker` | Base executor with Docker support for container builds |

### Commands

| Command | Description |
|---------|-------------|
| `setup` | Initialize project with caching |
| `health-check` | Check API health with retry logic |
| `validate-deployment` | Verify deployment with comprehensive checks |
| `notify` | Send Globomantics-branded notifications |

### Jobs

| Job | Description |
|-----|-------------|
| `build` | Build the Robot Fleet project |
| `test` | Run tests with coverage |
| `deploy-and-verify` | Deploy and validate deployment |

## Examples

### Basic Build and Test

```yaml
version: 2.1

orbs:
  robot-fleet: globomantics/robot-fleet@1.0.0

workflows:
  build-test:
    jobs:
      - robot-fleet/build
      - robot-fleet/test:
          requires:
            - robot-fleet/build
```

### Health Check

```yaml
version: 2.1

orbs:
  robot-fleet: globomantics/robot-fleet@1.0.0

jobs:
  check-production:
    executor: robot-fleet/default
    steps:
      - robot-fleet/health-check:
          url: https://api.globomantics.com
          retries: 10
          timeout: 30

workflows:
  monitor:
    jobs:
      - check-production
```

### Full CI/CD Pipeline

```yaml
version: 2.1

orbs:
  robot-fleet: globomantics/robot-fleet@1.0.0

workflows:
  build-test-deploy:
    jobs:
      - robot-fleet/build

      - robot-fleet/test:
          requires:
            - robot-fleet/build

      - robot-fleet/deploy-and-verify:
          environment: staging
          url: https://staging.globomantics.com
          requires:
            - robot-fleet/test
          filters:
            branches:
              only: main
```

## Development

### Project Structure

```
orb-source/
├── orb.yml              # Packed orb (single file)
├── README.md            # This file
└── src/                 # Unpacked orb source
    ├── @orb.yml         # Orb metadata
    ├── commands/        # Command definitions
    ├── executors/       # Executor definitions
    ├── jobs/            # Job definitions
    └── examples/        # Usage examples
```

### Local Development

```bash
# Validate orb syntax
circleci orb validate orb.yml

# Pack orb from source
circleci orb pack src > orb.yml

# Publish dev version
circleci orb publish orb.yml globomantics/robot-fleet@dev:alpha
```

### Publishing

```bash
# Publish to orb registry
circleci orb publish orb.yml globomantics/robot-fleet@1.0.0

# Promote dev to production
circleci orb publish promote globomantics/robot-fleet@dev:alpha patch
```

## Course Integration

This orb is used in the **CircleCI Advanced Configuration** course to demonstrate:

1. **Module 3, Demo 4**: Creating custom orbs
2. Orb structure and components
3. Local development workflow
4. Publishing to the orb registry

## Resources

- [CircleCI Orb Documentation](https://circleci.com/docs/orb-intro/)
- [Orb Registry](https://circleci.com/developer/orbs)
- [Orb Development Kit](https://circleci.com/docs/orb-development-kit/)
- [Orb Testing](https://circleci.com/docs/testing-orbs/)

## License

MIT License - Globomantics Corporation
