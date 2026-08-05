
import('./src/components/AiScheduler/AiSchedulingEngine.js').then(module => {
    const processMessage = module.processUserMessage;
    const history = [
        { sender: 'user', text: 'what is latest news headline of india' },
        { sender: 'user', text: '[SYSTEM: Web Search Results for latest news India: The Indian Express: Latest News Today, Breaking News, India ... | India Latest News: Top National Headlines Today & Breaking News]' }
    ];
    processMessage(history, { staffRole: 'Cook', currentView: 'Staff App', myInventory: [], salary: 18500, chats: [], performance: null, roleContext: {}, screenContext: '' }).then(console.log).catch(console.error);
});

