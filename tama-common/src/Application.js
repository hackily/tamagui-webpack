import React from 'react';
import { Input, styled, TamaguiProvider, YStack } from 'tamagui';
import config from '../tamagui.config';

const TransparentInput = styled(Input, {
  borderColor: 'transparent',
  borderWidth: 0,
  outlineColor: 'transparent',
  hoverStyle: {
    borderColor: 'transparent',
    outlineColor: 'transparent',
    borderWidth: 0,
  },
  focusStyle: {
    borderColor: 'transparent',
    outlineColor: 'transparent',
    borderWidth: 0,
  },
});

export default function Application() {
  return (
    <TamaguiProvider
      config={config}
      disableRootThemeClass
      defaultTheme="dark"
    >
      <YStack space="$4">
        <TransparentInput placeholder="transparent border 0px"/>
        <Input placeholder="default input" />
      </YStack>
    </TamaguiProvider>
  );
}
