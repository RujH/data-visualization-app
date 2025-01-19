# Data Visualization App

A React TypeScript application for visualizing and analyzing session data with synchronized video and audio playback capabilities.

## Features

- **Session Data Upload**: Upload entire folders containing session data through an intuitive interface
- **Video Playback**: Support for MP4 video playback with synchronized timestamps
- **Multi-Audio Support**: 
  - Handle multiple audio sources simultaneously
  - Individual volume controls for each audio source
  - Mute/unmute controls per audio track
  - Automatic synchronization with video timestamps
- **Modern UI**: Built with Chakra UI for a clean, responsive interface

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

## Usage

1. **Upload Session Data**
   - Click on the folder upload button on the home page
   - Select a folder containing your session data
   - The app will automatically process the files

### Session Data Folder Structure

Your session data folder should contain the following files:

```
session-folder/
├── Videos/[timestamp]_video.mp4    # Main video file with timestamp prefix
├── Audios/[timestamp]_audio1.wav   # Audio file with timestamp prefix
├── Audios/[timestamp]_audio2.wav   # Additional audio files (optional)
└── Sensors/data.csv                 # Time-series data for visualization
```

**File Requirements:**
- Video files (.mp4):
  - Must have a timestamp prefix (e.g., "1234567890_video.mp4")
  - Used as the main video content
- Audio files (.wav):
  - Must have a timestamp prefix (e.g., "1234567890_audio.wav")
  - Multiple audio files supported
  - Timestamps used for synchronization with video
- CSV files:
  - Contains time-series data for visualization
  - Data points sync with video timestamps

2. **Video Playback**
   - Navigate to the video page using the interface
   - Video playback controls are available at the bottom of the player

3. **Audio Management**
   - External audio sources appear in a list next to the video
   - Use checkboxes to mute/unmute individual audio tracks
   - Adjust volume using the slider controls
   - Audio automatically syncs with video timestamps

## Technologies Used

- React
- TypeScript
- Chakra UI
- React Router
- File API
- Web Audio API

## Project Structure

```
src/
├── components/
│   └── AudioPlayer.tsx    # Handles multi-audio playback
├── pages/
│   ├── HomePage.tsx       # Main upload interface
│   └── VideoPage.tsx      # Video playback with audio sync
└── FileContext.tsx        # Global file state management
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.