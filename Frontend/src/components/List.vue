<template>
    <!-- 
    This div element is used to iterate over each ask in the kraken.asks array.
    It utilizes the v-for directive to loop through each item, binding each one to the variable 'ask'.
    The :key attribute is crucial for Vue's virtual DOM to efficiently track and update the list of asks.
    -->
    <div 
        class="lCard cstyle pt-4 mt-4 ml-2 mr-2" 
        v-for="kraken in krakens" 
        :key="kraken.id" 
    >
        <div class="pl-1">
            <div class="mb-3">
                <h5 class=" f-white">
                    {{ kraken.name }} <!-- Display the name of the kraken -->
                </h5>
            </div>
            <div class="content">
                <div class="container mb-2">
                    <div 
                        class="row fsize" 
                        v-for="ask in kraken.asks"
                        :key="ask.id" 
                    >   
                        <div class="col tred">
                            <b>{{ ask[0] }}</b> <!-- Display the price of the ask -->
                        </div>
                        <div class="col">
                            <b>{{ ask[1] }}</b> <!-- Display the quantity of the ask -->
                        </div>
                    </div>
                </div>
                <div class="total container spread-color text-center">
                    <div class="row">
                        <div>
                            <b> Spread: {{ parseFloat(kraken.midPrice.toFixed(3)) }}</b> <!-- Display the mid price of the kraken -->
                        
                            <b> ({{ parseFloat(kraken.spread.toFixed(4)) }} %)</b> <!-- Display the spread of the kraken -->
                        </div>
                    </div>
                </div>
            <!-- 
            It employs the v-for directive to loop through each bid item, binding each one to the variable 'bid'.
            The :key attribute is crucial for Vue's virtual DOM to efficiently track and update the list of bids.
            -->
                <div 
                    class="container below mt-2" 
                    v-for="bid in kraken.bids" 
                    :key="bid.id"
                >
                    <div class="row fsize">
                        <div class="col tg">
                            <b>{{ bid[0] }}</b> <!-- Display the price of the bid -->
                        </div>
                        <div class="col">
                            <b>{{ bid[1] }}</b> <!-- Display the quantity of the bid -->
                        </div>
                    </div>
                </div>
            </div>            
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
    setup() {
        // Reactive variable to hold krakens data
        const krakens = ref([]);

        // Function to setup WebSocket connection
        const setupWebSocket = () => {
            const ws = new WebSocket("ws://localhost:4000");

            // WebSocket connection established
            ws.onopen = () => {
                console.log("WebSocket connection established");
            };

            // WebSocket error
            ws.onerror = (error) => {
                // Establishing a WebSocket connection to the server running on localhost at port 4000
                console.error("WebSocket error:", error);
            };

            // WebSocket message received
            ws.onmessage = (message) => {
                // Parse the received JSON data
                const data = JSON.parse(message.data);
                // Update krakens data with received data
                krakens.value = data;
            };

            // WebSocket connection closed
            ws.onclose = () => {
                console.log("WebSocket connection closed");
            }
        };
        // Run setupWebSocket function when component is mounted
        onMounted(() => {
            setupWebSocket();
        });
        return {
            krakens
        };
    }
};
</script>
