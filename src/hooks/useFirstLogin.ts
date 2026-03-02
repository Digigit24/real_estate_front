// src/hooks/useFirstLogin.ts
import { useEffect, useState } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { crmService } from '@/services/crmService';

const FIRST_LOGIN_KEY = 'realestate_first_login_done';

export const useFirstLogin = () => {
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const runFirstLoginSetup = async () => {
      // Check if already done this session
      if (localStorage.getItem(FIRST_LOGIN_KEY)) return;

      setIsInitializing(true);
      try {
        // Step 1: Check if pipeline stages exist
        const stages = await crmService.getLeadStatuses();

        // Step 2: If empty, seed defaults
        if (stages.count === 0) {
          await inventoryService.initializePipelineDefaults();
          console.log('Pipeline stages seeded successfully');
        }

        // Mark first login as done for this session
        localStorage.setItem(FIRST_LOGIN_KEY, 'true');
      } catch (err) {
        console.warn('First login setup skipped or failed:', err);
        // Don't block the user - this is a background task
      } finally {
        setIsInitializing(false);
      }
    };

    runFirstLoginSetup();
  }, []);

  return { isInitializing };
};
