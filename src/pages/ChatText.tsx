import Chat from './Chat';

export default function ChatTest() {
    const testUser = {
        id: 'test-1',
        name: 'Test User',
        username: '@testuser',
        avatar: 'TU',
        verified: true,
        isOnline: true
    };

    return (
        <div className="h-screen bg-slate-900">
            <div className="h-full max-w-4xl mx-auto">
                <Chat 
                    user={testUser}
                />
            </div>
        </div>
    );
}