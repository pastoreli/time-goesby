import syncStorage from '@react-native-async-storage/async-storage';
import { OnboardingSections, StorageKeys } from '../../consts';
import { useEffect, useState } from 'react';
import { SettingsOnboarding } from '../../interfaces/settings';
import {
  isAndroidAlarmPermissionAllowed,
  isNotificationAllowed,
} from '../../utils/notification';
import { Platform } from 'react-native';

const useSettings = () => {
  const updateSorage = async (key: StorageKeys, data: string) => {
    await syncStorage.setItem(key, data);
  };

  const getOnboardingSettings = async (): Promise<SettingsOnboarding> => {
    const result = await syncStorage.getItem(StorageKeys.SETTINGS_ONBOARDING);
    return result ? JSON.parse(result) : {};
  };

  const handleOnboardingView = async (value: keyof SettingsOnboarding) => {
    const result = await getOnboardingSettings();
    result[value] = true;
    await updateSorage(StorageKeys.SETTINGS_ONBOARDING, JSON.stringify(result));
  };

  const getOnboardingFlow = async () => {
    const flow: OnboardingSections[] = [];
    const onboardingSettings = await getOnboardingSettings();

    if (!onboardingSettings.intro) {
      flow.push(OnboardingSections.INTRO);
    }

    if (!(await isNotificationAllowed())) {
      flow.push(
        Platform.OS === 'ios'
          ? OnboardingSections.ALLOW_NOTIFICATIONS_IOS
          : OnboardingSections.ALLOW_NOTIFICATIONS_ANDROID,
      );
    }

    if (
      Platform.OS === 'android' &&
      !(await isAndroidAlarmPermissionAllowed())
    ) {
      flow.push(OnboardingSections.ALLOW_ALARM_ANDROID);
    }

    if (!onboardingSettings.doNotDisturb) {
      flow.push(
        Platform.OS === 'ios'
          ? OnboardingSections.DO_NOT_DISTURB_IOS
          : OnboardingSections.DO_NOT_DISTURB_ANDROID,
      );
    }

    return flow;
  };

  return {
    getOnboardingSettings,
    handleOnboardingView,
    getOnboardingFlow,
  };
};

export default useSettings;