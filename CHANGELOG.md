# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

# 2.4.0 (2023-11-25)
### Fix
- WOLFAPIError not respecting 0 value
### Add
- Support for Roles in profile
### Changed
- Social Sign in Behavior
- Role helpers are now their own dedicated helper

# 2.3.6 (2023-11-10)
### Fix
- Stage Client: RangeError: offset is out of bounds

# 2.3.5 (2023-11-05)
### Fix
- Stage Client static? Maybe?

# 2.3.4 (2023-11-05)
### Fix
- Stage Client not completing final audio buffer

# 2.3.2 (2023-11-04)
### Added
- client.connect()
- client.disconnect()
- client.reconnect()
### Changed
- Updated dependencies
- Stage Client refactor (Fix mp4/m3u8 and general choppiness)

# 2.3.1 (2023-10-26)
### Added
- slowRateInMilliseconds to profile updates

# 2.3.0 (2023-10-11)
### Added
- Support for Channel Roles
### Fixed
- Incorrect JSDocs for updating Channel/Subscriber profiles
### Changed
- Update README.md to be more up to date
- Update multimedia to support additional methods

# 2.2.11 (2023-10-07)
### Fixed
- Revert nanoid to 4.0.2

# 2.2.10 (2023-10-06)
### Changed
- Replace yaml with js-yaml, remove config dependency

# 2.2.9 (2023-10-06)
### Fixed
- object is not iterable

# 2.2.8 (2023-10-06)
### Changed
- Update socket.io version to match server
- Update Dependencies
### Removed
- Request Queue

# 2.2.7 (2023-09-26)
### Fixed
- Misc calling self cognito instead of client
### Changed
- Removed redundant WOLF client set in stage client
- Update README.md to be more up to date
- Minor refactor around batching

# 2.2.6 (2023-07-26)
### Changed
- Disable rate limiter by default

# 2.2.4 (2023-07-25)
### Added
- client.stage.getAvailableStages(targetGroupId, forceNew)
### Fixed
- getStageSlots() not a function in Channel model

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

# 2.1.0 (2023-06-17)
### Added
- Support for group Verification Tiers

### Fixed
- Missing *dateOfBirth* to subscriber profile
- Updated subscriber profile update methods to include dateOfBirth

### Additional
- Dependency Updates

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
