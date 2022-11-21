function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea"); textArea.value = text; textArea.style.top = "0"; textArea.style.left = "0"; textArea.style.position = "fixed"; document.body.appendChild(textArea); textArea.focus(); textArea.select(); try { var successful = document.execCommand('copy'); var msg = successful ? 'successful' : 'unsuccessful'; } catch (err) { console.error('Fallback: Oops, unable to copy', err) }
    document.body.removeChild(textArea)
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) { fallbackCopyTextToClipboard(text); return }
    navigator.clipboard.writeText(text).then(function () { }, function (err) { console.error('Async: Could not copy text: ', err) })
}
let text = questionText.innerText + "\n" + Array.from(document.querySelectorAll(".MC_answer_option")).map((e, i) => `${["A", "B", "C", "D", "E"][i]}. ${e.innerText.trim()}`).join("\n")
fallbackCopyTextToClipboard(text)