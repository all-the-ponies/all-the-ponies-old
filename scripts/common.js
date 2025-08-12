
// Load JSON text from server hosted file and return JSON parsed object
// From stackoverflow https://stackoverflow.com/a/4117299/17129659
export function loadJSON(filePath) {
  // Load json file;
  var json = loadTextFileAjaxSync(filePath, "application/json");
  // Parse json
  return JSON.parse(json);
}


// Load text with Ajax synchronously: takes path to file and optional MIME type
function loadTextFileAjaxSync(filePath, mimeType)
{
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  if (mimeType != null) {
    if (xmlhttp.overrideMimeType) {
      xmlhttp.overrideMimeType(mimeType);
    }
  }
  let error = xmlhttp.send();
  if (xmlhttp.status==200 && xmlhttp.readyState == 4 ) {
    return xmlhttp.responseText;
  }
  else {
    
    // TODO Throw exception
    return null;
  }
}

export function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
}

export function fixName(name) {
  name = name.replaceAll('|', '')
  return name
}

export class Localization {
  constructor(file, languageSelector = null) {
    if (languageSelector == null) {
      languageSelector = document.getElementById('language')
    }
    this.languageSelector = languageSelector
    this._language = 'english'

    this.dictionary = loadJSON(file)
  }

  get language() {
    try {
      this._language = this.languageSelector.value
      return this._language
    } catch {
      return this._language
    }
  }

  set language(language) {
    this._language = language
    try {
      this.languageSelector.value = language
    } catch {
      return
    }
  }

  translate(key) {
    if (typeof this.dictionary[key] != 'undefined') {
      return this.dictionary[key][this.language] || this.dictionary[key]['english']
    } else {
      return key
    }
  }
}

export var LOC = new Localization('/assets/json/localization.json')

export function capitalize(str) {
  if (str == '') return ''
  return str[0].toLocaleUpperCase() + str.substr(1).toLocaleLowerCase()
}

export function toTitleCase(str) {
  return str.split(' ').map(capitalize).join(' ')
}

export function scrollIntoViewWithOffset(element, offset, behavior = 'instant') {
  window.scrollTo({
    behavior: behavior,
    top:
      element.getBoundingClientRect().top -
      document.body.getBoundingClientRect().top -
      offset,
  })
}

export function getCurrentScroll() {
  return document.documentElement.scrollTop || document.body.scrollTop
}

export function setURL(url, replace = false) {
    if (history && history.replaceState) {
      if (replace) {
        history.replaceState("", "", url);
      } else {
        history.pushState('', '', url)
      }
    } else {
        location.href = url
    }
}

export function setUrlParameter(param, value, replace = false) {
    const url = new URL(location.href)
    if (value) {
      url.searchParams.set(param, encodeURIComponent(value))
    } else {
      url.searchParams.delete(param)
    }

    
    if (history && history.replaceState) {
      if (replace) {
        history.replaceState("", "", url.toString());
      } else {
        history.pushState('', '', url.toString())
      }
    } else {
        location.href = url.toString();
    }
}

export function getUrlParameter(param) {
    const url = new URL(location.href)
    const value = url.searchParams.get(param)
    console.log(value)
  return value == null ? null : decodeURIComponent(value)
}

export function linkHandler(e) {
    // e.preventDefault()
    console.log('target', e.target)
    const link = e.target.closest('a')
    console.log('link', link)
    if (link?.tagName == 'A') {
        const url = new URL(link.href)
        console.log(location)
        console.log(url)
        if (url.origin == location.origin) {
            e.preventDefault()
            setURL(link.href)
            window.app.refreshPage()
        }
    }
}

export function createElement(tagName, attrs = {}, children = []) {
  let element = document.createElement(tagName)
  for (let [attr, value] of Object.entries(attrs)) {
    if (attr == 'text') {
      element.innerText = value
    } else {
      element.setAttribute(attr, value)
    }
  }

  for (let child of children) {
    element.appendChild(child)
  }

  return element
}

// Taken from https://stackoverflow.com/a/5354536/17129659 by Tokimon
export function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}


export function formatTime(time) {
  if (Math.trunc(time) == 0) return "0s";
  var out = "";
  var d_h_m_s = [0, 0, 0, 0];
  var letters = ["d", "h", "m", "s"];
  [time, d_h_m_s[0]] = truncTime(time, 86400);
  [time, d_h_m_s[1]] = truncTime(time, 3600);
  [time, d_h_m_s[2]] = truncTime(time, 60);
  if (d_h_m_s[0] > 0 || d_h_m_s[1] > 0) d_h_m_s[3] = 0;
  else d_h_m_s[3] = Math.trunc(time);
  for (var i = 0; i < d_h_m_s.length; i++) {
    if (d_h_m_s[i] > 0) {
      out += " " + d_h_m_s[i] + letters[i];
    }
  }
  return out.trim();
}

function truncTime(time, value) {
  var num = Math.trunc(time / value);
  time -= value * num;
  return [time, num];
}


export const CATEGORIES = loadJSON('/assets/json/category-page-map.json')
