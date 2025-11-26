<template>
  <h1>Crawler development server</h1>

  <br>

  <button id="crawler_start_button" @click="startCrawling">start crawler</button>

  <br>

  <p id="message"></p>
</template>

<script>
export default{
  methods: {

    /**
     * starts the crawling process
     */
    async startCrawling() {
      try {
        //start the parsing process through the parser controll server
        const res = await fetch("http://localhost:3000/api/run-parser", { method: "POST" })
        const data = await res.json()
        console.log("Server response:", data)

        //for now: show this message on the webpage to show that the crawler works
        document.getElementById("message").textContent = "The crawling function is not yet implemented, but at least this button does its job"
      
        } catch (err) {
        console.error("Fetch error:", err)
      }
    }
  }
}
</script>