/* eslint-disable no-unused-expressions */
export * from './Common.js';

import ChannelEntities from '../../../../src/constants/ChannelEntities.js';
import Command from '../../../../src/constants/Command.js';
import Common from './Common.js';
import { expect } from 'chai';
import WOLFResponse from '../../../../src/entities/WOLFResponse.js';

const COMMAND = 'group profile';

export const isMatch = (group, referenceObject) => {
  if (referenceObject === null) {
    expect(referenceObject).to.not.be.undefined;
    expect(referenceObject).to.be.null;
    expect(group).to.not.be.undefined;
    expect(group).to.be.null;
  } else {
    expect(referenceObject).to.not.be.undefined;
    expect(referenceObject).to.not.be.null;
    expect(referenceObject).to.be.an('object');
    expect(group).to.not.be.undefined;
    expect(group).to.not.be.null;
    expect(group).to.be.an('object');

    const { members, ...inputObject } = group;

    expect(Common.normalise(inputObject)).to.deep.includes(referenceObject);
  }
};

const responseBody = [
  {
    base: {
      id: 1,
      name: 'Test Group Name',
      hash: 'Test Group Hash',
      description: 'Test Group Description',
      reputation: 3.7,
      premium: false,
      members: 11,
      official: false,
      owner: {
        id: 1,
        hash: 'Test GroupOwnerHash'
      },
      peekable: false,
      icon: 1,
      iconHash: 'Test Group IconHash',
      iconInfo: {
        availableTypes: [],
        availableSizes: {
          small: '/avatar/group/1/Test Group IconHash/small',
          medium: '/avatar/group/1/Test Group IconHash/medium',
          large: '/avatar/group/1/Test Group IconHash/large'
        }
      },
      verificationTier: 'none',
      giftAnimationDisabled: false
    },
    extended: {
      id: 1,
      discoverable: false,
      advancedAdmin: false,
      locked: false,
      questionable: false,
      entryLevel: 0,
      passworded: false,
      language: 1,
      hub: 'none',
      longDescription: 'Test Long Description'
    },
    messageConfig: {
      id: 1,
      disableImage: false,
      disableImageFilter: false,
      disableVoice: false,
      disableHyperlink: false,
      slowModeRateInSeconds: 0
    },
    audioConfig: {
      id: 1,
      enabled: false,
      minRepLevel: 0,
      stageId: null
    },
    audioCounts: {
      id: 1,
      consumerCount: 0,
      broadcasterCount: 0
    }
  },
  {
    base: {
      id: 2,
      name: 'Test Group Name',
      hash: 'Test Group Hash',
      description: 'Test Group Description',
      reputation: 3.7,
      premium: false,
      members: 11,
      official: false,
      owner: {
        id: 2,
        hash: 'Test GroupOwnerHash'
      },
      peekable: false,
      icon: 1,
      iconHash: 'Test Group IconHash',
      iconInfo: {
        availableTypes: [],
        availableSizes: {
          small: '/avatar/group/2/Test Group IconHash/small',
          medium: '/avatar/group/2/Test Group IconHash/medium',
          large: '/avatar/group/2/Test Group IconHash/large'
        }
      },
      verificationTier: 'none',
      giftAnimationDisabled: false
    },
    extended: {
      id: 2,
      discoverable: false,
      advancedAdmin: false,
      locked: false,
      questionable: false,
      entryLevel: 0,
      passworded: false,
      language: 1,
      hub: 'none',
      longDescription: 'Test Long Description'
    },
    messageConfig: {
      id: 2,
      disableImage: false,
      disableImageFilter: false,
      disableVoice: false,
      disableHyperlink: false,
      slowModeRateInSeconds: 0
    },
    audioConfig: {
      id: 2,
      enabled: false,
      minRepLevel: 0,
      stageId: null
    },
    audioCounts: {
      id: 2,
      consumerCount: 0,
      broadcasterCount: 0
    }
  }
];

const objects = [

  {
    id: 1,
    name: 'Test Group Name',
    hash: 'Test Group Hash',
    description: 'Test Group Description',
    reputation: 3.7,
    premium: false,
    official: false,
    owner: {
      id: 1,
      hash: 'Test GroupOwnerHash'
    },
    peekable: false,
    icon: 1,
    iconHash: 'Test Group IconHash',
    iconInfo: {
      availableTypes: [],
      availableSizes: {
        small: '/avatar/group/1/Test Group IconHash/small',
        medium: '/avatar/group/1/Test Group IconHash/medium',
        large: '/avatar/group/1/Test Group IconHash/large'
      },
      targetType: 'channel'
    },
    verificationTier: 'none',
    giftAnimationDisabled: false,
    extended: {
      id: 1,
      discoverable: false,
      advancedAdmin: false,
      locked: false,
      questionable: false,
      entryLevel: 0,
      passworded: false,
      language: 1,
      hub: 'none',
      longDescription: 'Test Long Description'
    },
    messageConfig: {
      id: 1,
      disableImage: false,
      disableImageFilter: false,
      disableVoice: false,
      disableHyperlink: false,
      slowModeRateInSeconds: 0
    },
    audioConfig: {
      id: 1,
      enabled: false,
      minRepLevel: 0,
      stageId: null
    },
    audioCounts: {
      id: 1,
      consumerCount: 0,
      broadcasterCount: 0
    }
  },
  {
    id: 2,
    name: 'Test Group Name',
    hash: 'Test Group Hash',
    description: 'Test Group Description',
    reputation: 3.7,
    premium: false,
    official: false,
    owner: {
      id: 2,
      hash: 'Test GroupOwnerHash'
    },
    peekable: false,
    icon: 1,
    iconHash: 'Test Group IconHash',
    iconInfo: {
      availableTypes: [],
      availableSizes: {
        small: '/avatar/group/2/Test Group IconHash/small',
        medium: '/avatar/group/2/Test Group IconHash/medium',
        large: '/avatar/group/2/Test Group IconHash/large'
      },
      targetType: 'channel'
    },
    verificationTier: 'none',
    giftAnimationDisabled: false,
    extended: {
      id: 2,
      discoverable: false,
      advancedAdmin: false,
      locked: false,
      questionable: false,
      entryLevel: 0,
      passworded: false,
      language: 1,
      hub: 'none',
      longDescription: 'Test Long Description'
    },
    messageConfig: {
      id: 2,
      disableImage: false,
      disableImageFilter: false,
      disableVoice: false,
      disableHyperlink: false,
      slowModeRateInSeconds: 0
    },
    audioConfig: {
      id: 2,
      enabled: false,
      minRepLevel: 0,
      stageId: null
    },
    audioCounts: {
      id: 2,
      consumerCount: 0,
      broadcasterCount: 0
    }
  }
];
