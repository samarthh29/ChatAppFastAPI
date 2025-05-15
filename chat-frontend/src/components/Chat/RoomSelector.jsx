import { PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useChat } from '../../hooks/useChat';

const RoomSelector = ({ rooms, currentRoom, onCreateRoom }) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { setCurrentRoom } = useChat();

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName.trim());
      setNewRoomName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-semibold text-gray-700">Rooms</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-gray-500 hover:text-indigo-600"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {showCreateForm && (
        <div className="flex gap-2 px-2 mb-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="New room name"
            className="flex-1 text-sm border rounded px-2 py-1"
          />
          <button
            onClick={handleCreateRoom}
            className="bg-indigo-600 text-white px-2 py-1 rounded text-sm"
          >
            Create
          </button>
        </div>
      )}

      <div className="space-y-1">
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => setCurrentRoom(room)}
            className={`w-full text-left px-3 py-2 text-sm rounded-md ${currentRoom === room ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
          >
            # {room}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomSelector;