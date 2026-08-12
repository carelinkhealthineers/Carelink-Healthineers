export interface MeetingPollOption {
  id: string;
  text: string;
  votes: string[]; // User IDs who voted
}

export interface MeetingPoll {
  id: string;
  question: string;
  options: MeetingPollOption[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface MeetingQAItem {
  id: string;
  question: string;
  askedBy: string;
  upvotes: string[]; // User IDs
  isAnswered: boolean;
  answerText?: string;
  createdAt: string;
}

export interface MeetingChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'document' | 'other';
  createdAt: string;
}

export interface ExtendedMeeting {
  id: string;
  room_id: string;
  title: string;
  host_name: string;
  client_name: string;
  scheduled_at: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  
  // Extended Features requested by user
  password?: string;
  isPasswordProtected?: boolean;
  isWaitingRoomEnabled?: boolean;
  maxParticipants?: number;
  expiryMinutes?: number;
  isFavourite?: boolean;
  waitingRoomQueue?: Array<{ userId: string; username: string; joinedAt: string }>;
  admittedUserIds?: string[];
  polls?: MeetingPoll[];
  qaItems?: MeetingQAItem[];
  chatMessages?: MeetingChatMessage[];
}

const STORAGE_KEY_MEETINGS = 'carelink_extended_meetings_v2';
const STORAGE_KEY_SETTINGS = 'carelink_meeting_settings_v2';

export interface AdminMeetingSettings {
  defaultWaitingRoom: boolean;
  defaultPasswordProtected: boolean;
  defaultMaxParticipants: number;
  defaultExpiryMinutes: number;
  noiseSuppressionDefault: boolean;
  hdVideoDefault: boolean;
  hdAudioDefault: boolean;
  livekitUrl: string;
}

export const getDefaultSettings = (): AdminMeetingSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load meeting settings:', err);
  }
  return {
    defaultWaitingRoom: false,
    defaultPasswordProtected: false,
    defaultMaxParticipants: 100,
    defaultExpiryMinutes: 120,
    noiseSuppressionDefault: true,
    hdVideoDefault: true,
    hdAudioDefault: true,
    livekitUrl: 'wss://carelink-healthineers-bm6n32il.livekit.cloud'
  };
};

export const saveSettings = (settings: AdminMeetingSettings) => {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
};

export const getStoredMeetings = (): ExtendedMeeting[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEETINGS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to read stored meetings:', err);
  }

  // Initial Seed Samples if empty
  const defaultList: ExtendedMeeting[] = [
    {
      id: 'mtg-1',
      room_id: 'Sovereign-Suite-Dental-01',
      title: 'Dürr Dental VS 900 S Compression System Technical Audit',
      host_name: 'Dr. Marcus Vance',
      client_name: 'St. Mary Dental Hospital Procurement',
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      status: 'scheduled',
      notes: 'Discuss suction flow velocity, noise containment, and installation timeline.',
      created_at: new Date().toISOString(),
      isPasswordProtected: false,
      isWaitingRoomEnabled: false,
      isFavourite: true,
      maxParticipants: 50,
      polls: [
        {
          id: 'poll-1',
          question: 'Preferred Suction Vacuum Capacity level?',
          options: [
            { id: 'opt-1', text: '300 L/min Flow', votes: ['usr_101'] },
            { id: 'opt-2', text: '500 L/min High Capacity', votes: ['usr_102', 'usr_103'] }
          ],
          createdBy: 'Dr. Marcus Vance',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ]
    },
    {
      id: 'mtg-2',
      room_id: 'Medical-Suite-Executive-Alpha',
      title: 'Hospital Executive B2B Equipment Briefing',
      host_name: 'Director Elena Rostova',
      client_name: 'Carelink Healthineers Board',
      scheduled_at: new Date(Date.now() - 3600000).toISOString(),
      status: 'active',
      notes: 'Reviewing quarterly equipment allotment and warranty extensions.',
      created_at: new Date().toISOString(),
      isPasswordProtected: true,
      password: 'carelink123',
      isWaitingRoomEnabled: true,
      isFavourite: false,
      maxParticipants: 100
    }
  ];

  localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(defaultList));
  return defaultList;
};

export const saveMeetings = (meetings: ExtendedMeeting[]) => {
  localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(meetings));
};

export const toggleFavouriteMeeting = (meetingId: string): ExtendedMeeting[] => {
  const meetings = getStoredMeetings();
  const updated = meetings.map(m => m.id === meetingId ? { ...m, isFavourite: !m.isFavourite } : m);
  saveMeetings(updated);
  return updated;
};
