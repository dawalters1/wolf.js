# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 2.1.2 *Unreleased*
### Added
- client.charm.getSubscriberSelectedList(subscriberId)
- Stage client events model methods
  - play(data)
  - stop()
  - pause()
  - resume()
  - getBroadcastState()
  - isReady()
  - isPlaying()
  - isPaused()
  - isIdle()
  - duration()
  - getSlotId()
- Change Log

### Fixed
- Fixed various models lacking toJSON() method
- Multiple children in the same command can share a phrase name

# 2.1.1 (2023-06-19)
### Fixed
- Multimedia client would misbehave when multiple wolf client instances existed on the same instance

# 2.1.0 (2023-06-17)
### Added
- Support for group Verification Tiers

### Fixed
- Missing *dateOfBirth* to subscriber profile
- Updated subscriber profile update methods to include dateOfBirth

### Additional
- Dependency Updates

# 2.1.1 (2023-06-19)
### Fixed
- Multimedia client would misbehave when multiple wolf client instances existed on the same instance

# 2.0.7 (2023-05-31)
### Fixed
- Group profile update method not working
- Unable to upload group profile image

# 2.0.2 (2023-05-24)
### Added
- LiveEvent support in discovery

### Fix
- Edge case issue when sending text messages
- toReadableTime not returning 0 seconds

### Changed
- Update to port 443

# 2.0.1 (2023-05-24)
### Changed
- Message conversation list version to 4

# 2.0.0 (2023-03-31)
- ESM version
- Object-Oriented models
- Large group support
- Streamline helpers and utilities