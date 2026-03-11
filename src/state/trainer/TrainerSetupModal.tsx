'use client';

import { Button, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { useTrainer } from './use-trainer';

/**
 * Modal that prompts the user to set their trainer name.
 * This is the precondition gate for deferred actions --
 * actions are stored when no trainer name is set and
 * executed automatically after the name is provided.
 */
export function TrainerSetupModal() {
  const { isSetupOpen, closeSetup, setTrainerName } = useTrainer();
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed) {
      setTrainerName(trimmed);
      setName('');
    }
  };

  return (
    <Modal opened={isSetupOpen} onClose={closeSetup} title="Set Your Trainer Name" centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Set your trainer name to favorite and compare Pokemon. Your pending action will be
          executed automatically.
        </Text>
        <TextInput
          label="Trainer Name"
          placeholder="Ash Ketchum"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          Save & Continue
        </Button>
      </Stack>
    </Modal>
  );
}
