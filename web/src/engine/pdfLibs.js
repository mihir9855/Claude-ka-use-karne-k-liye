let pending = null

/** Loads jsPDF, autotable and html2canvas on first use; the engine reads them from window. */
export function loadPdfLibs() {
  if (window.jspdf && window.html2canvas && window.jspdf.jsPDF.API.autoTable) return Promise.resolve()
  if (!pending) {
    pending = Promise.all([import('jspdf'), import('html2canvas')])
      .then(async ([j, h]) => {
        window.jspdf = { jsPDF: j.jsPDF }
        window.html2canvas = h.default
        const at = await import('jspdf-autotable')
        const apply = at.applyPlugin || (at.default && at.default.applyPlugin)
        if (apply && !j.jsPDF.API.autoTable) apply(j.jsPDF)
      })
      .catch((e) => {
        pending = null
        throw e
      })
  }
  return pending
}
