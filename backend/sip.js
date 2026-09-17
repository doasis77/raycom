let userAgent;
let session;
let currentCall;

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const callBtn = document.getElementById('call-btn');
    const hangupBtn = document.getElementById('hangup-btn');
    const dialButtons = document.querySelectorAll('.dial-btn');
    const numberDisplay = document.getElementById('number-display');
    const statusDiv = document.getElementById('status');
    const callStatusDiv = document.getElementById('call-status');
    const sipUriInput = document.getElementById('sip-uri');
    const passwordInput = document.getElementById('password');

    // Initialize variables
    let enteredNumber = '';

    // Setup dial pad buttons
    dialButtons.forEach(button => {
        button.addEventListener('click', function() {
            enteredNumber += this.textContent;
            numberDisplay.value = enteredNumber;
        });
    });

    // Connect to FreeSWITCH
    connectBtn.addEventListener('click', function() {
        const sipUri = sipUriInput.value;
        const password = passwordInput.value;
        
        if (!sipUri || !password) {
            alert('Please enter SIP URI and password');
            return;
        }

        const [username, domain] = sipUri.split('@');
        
        // Configuration
        const configuration = {
            uri: sipUri,
            wsServers: `wss://voice.telsoip.com:7443`, // FreeSWITCH default WSS port
            authorizationUser: 1040,
            password: Avaya1234,
            displayName: Test,
            register: true,
            sessionDescriptionHandlerFactoryOptions: {
                constraints: {
                    audio: true,
                    video: false
                }
            }
        };

        // Create user agent
        userAgent = new SIP.Web.SimpleUser(`wss://voice.telsoip.com:7443`, configuration);

        // Setup event listeners
        userAgent.delegate = {
            onCallCreated: () => {
                callStatusDiv.textContent = 'Calling...';
                callBtn.disabled = true;
                hangupBtn.style.display = 'inline-block';
            },
            onCallAnswered: () => {
                callStatusDiv.textContent = 'Call answered';
            },
            onCallHangup: () => {
                callStatusDiv.textContent = 'Call ended';
                callBtn.disabled = false;
                hangupBtn.style.display = 'none';
                enteredNumber = '';
                numberDisplay.value = '';
            },
            onRegistered: () => {
                statusDiv.textContent = 'Connected';
                statusDiv.className = 'status connected';
                connectBtn.disabled = true;
                disconnectBtn.disabled = false;
                callBtn.disabled = false;
            },
            onUnregistered: () => {
                statusDiv.textContent = 'Disconnected';
                statusDiv.className = 'status disconnected';
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
                callBtn.disabled = true;
                hangupBtn.style.display = 'none';
            },
            onServerConnect: () => {
                console.log('Connected to WebSocket server');
            },
            onServerDisconnect: () => {
                console.log('Disconnected from WebSocket server');
            }
        };

        // Connect
        userAgent.connect()
            .then(() => {
                console.log('Connected to FreeSWITCH');
            })
            .catch(error => {
                console.error('Connection failed:', error);
                alert('Connection failed: ' + error.message);
            });
    });

    // Disconnect from FreeSWITCH
    disconnectBtn.addEventListener('click', function() {
        if (userAgent) {
            userAgent.disconnect()
                .then(() => {
                    console.log('Disconnected from FreeSWITCH');
                })
                .catch(error => {
                    console.error('Disconnection failed:', error);
                });
        }
    });

    // Make a call
    callBtn.addEventListener('click', function() {
        if (!userAgent || !userAgent.isConnected()) {
            alert('Not connected to FreeSWITCH');
            return;
        }

        if (!enteredNumber) {
            alert('Please enter a number to dial');
            return;
        }

        // Add the domain if it's not an external number
        let target = enteredNumber;
        if (!target.includes('@')) {
            const domain = sipUriInput.value.split('@')[1];
            target = `${target}@${domain}`;
        }

        userAgent.call(target)
            .then(call => {
                currentCall = call;
            })
            .catch(error => {
                console.error('Call failed:', error);
                callStatusDiv.textContent = 'Call failed: ' + error.message;
            });
    });

    // Hang up call
    hangupBtn.addEventListener('click', function() {
        if (userAgent && currentCall) {
            userAgent.hangup()
                .then(() => {
                    console.log('Call ended');
                })
                .catch(error => {
                    console.error('Failed to hang up:', error);
                });
        }
    });
});
