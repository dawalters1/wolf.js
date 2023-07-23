# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

# 2.2.3 (2023-07-13)
### Added
- slotId to StageClient*Update models
- sourceSubscriberId to StageClient*Update models
### Fixed
- .toPrecision is not a function
- Incorrect class name in typings
- Incorrect type appearing in typings for slot updates

# 2.2.1 (2023-07-12)
### Added
- JSDoc
### Fixed
- canPerformAction
- joining channels
- sendMessage 
- constants lacking "subscriber profile unsubscribe"
- typos
- getting members list
- Incorrect models being called
- purchasing products
- Incorrect privileges in typings

# 2.2.0 (2023-07-08)
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
- client.notification.subscriber helper
    - **Methods**
      - getByIds(ids, languageId, forceNew = false)
      - getById(id, languageId, forceNew = false)
      - list(languageId, subscribe= true, forceNew = false)
      - clear()
      - delete(ids)
    - **Events**
      - subscriberNotificationListAdd
      - subscriberNoticicationListClear
      - subscriberNotificationListDelete

- client.notification.global helper
    - **Methods**
      - getByIds(ids, languageId, forceNew = false)
      - getById(id, languageId, forceNew = false)
      - list(languageId, subscribe= true, forceNew = false)
      - clear()
      - delete(ids)
    - **Events**
      - globalNotificationListAdd
      - globalNoticicationListClear
      - globalNotificationListDelete
- "VR" DeviceType

### Fixed
- Fixed various models lacking toJSON() method
- Multiple children in the same command can share a phrase name

### Deprecated
  - **Methods**
    - client.notification.list()
    - client.notification.clear()
  - **Events**
    - notificationReceived

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
