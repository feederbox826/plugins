(function () {
  'use strict';

  const btnId = 'delete-fp';
  const btn = document.createElement("button");
  btn.setAttribute("id", btnId);
  btn.classList.add('btn', 'btn-primary', 'ml-3');
  btn.innerHTML = 'Delete Fingerprints';
  btn.onclick = () => {
    removeFPQueue()
    hideSubmitFPButton
  };

  const submitSelector = "//button[span[starts-with(text(),'Submit')]]"

  function setupDeleteButton(selector, el) {
    if (!document.getElementById(btnId)) {
      const container = el.parentElement;
      container.appendChild(btn);
      sortElementChildren(container);
      el.classList.add('ml-3');
    }
  }

  stash.addEventListener('tagger:mutations:header', evt => {
    waitForElementByXpath(submitSelector, setupDeleteButton)
  });
  const hideSubmitFPButton = () => {
    const submitBtn = getElementByXpath(submitSelector)
    if (submitBtn) submitBtn.style.display = "none"
  }

  function removeFPQueue() {
    const DBNAME = "localforage"
    const STORENAME = "keyvaluepairs"
    const KEYNAME = "tagger"
    // hide submit button
    hideSubmitFPButton()
    const getIDBData = (transaction) => new Promise((resolve, reject) => {
      const result = transaction
        .objectStore(STORENAME)
        .get(KEYNAME)
      result.onsuccess = event => resolve(event.target.result)
      result.onerror = event => reject(event.target.errorCode)
    })

    const putIDBData = (transaction, data) => new Promise((resolve, reject) => {
      const result = transaction
        .objectStore(STORENAME)
        .put(data, KEYNAME)
      result.onsuccess = event => resolve(event.target.result)
      result.onerror = event => reject(event.target.errorCode)
    })

    const IDBOpenRequest = window.indexedDB.open(DBNAME)
    IDBOpenRequest.onsuccess = async (event) => {
      const db = event.target.result
      const transaction = db.transaction([STORENAME], "readwrite")
      const data = await getIDBData(transaction)
      // remove all fingerprints in array
      for (const arr of Object.keys(data.fingerprintQueue)) data.fingerprintQueue[arr] = []
      // replace object
      await putIDBData(transaction, data)
    }
  }
})();