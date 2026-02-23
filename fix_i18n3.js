const fs = require('fs');

try {
  let content = fs.readFileSync('/Users/jamiekwok/Documents/GitHub/travelTogether2/src/i18n.js', 'utf8');
  
  // Find the exact marker:
  const marker = `                    "empty": {
                        "title": "開始對話",
                        "desc": "選擇一個對話或開始新對話以傳送訊息。"
                    }
                }
            }
        }
    };`;
    
  if (content.includes(marker)) {
     const newContent = content.replace(marker, `                    "empty": {
                        "title": "開始對話",
                        "desc": "選擇一個對話或開始新對話以傳送訊息。"
                    }
                }
            }
        }
    }
};`);
     fs.writeFileSync('/Users/jamiekwok/Documents/GitHub/travelTogether2/src/i18n.js', newContent);
     console.log("Fixed missing closing brace.");
  } else {
     console.log("Marker varying, could not replace exactly.");
  }
} catch (e) {
  console.log(e);
}
