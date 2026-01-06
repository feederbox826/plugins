function quicksave() {
  console.log("Quicksave plugin loaded")
  const backup = () => fetch("graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: `{"query":"mutation{backupDatabase(input:{download:false})}"}`
  })
  const evenHandler = (e) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      backup()
      e.preventDefault()
    }
  }
  document.addEventListener("keydown", evenHandler)
}
quicksave()