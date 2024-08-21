import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface Choice {
  id: string;
  label?: string;
  checked?: boolean;
}

const ClearCacheAndReload: React.FC = () => {
  const [choices, setChoices] = useState<string[]>(["cache"]);

  const items: Choice[] = [
    {
      id: "cache",
      label: "Clear Cache",
    },
    {
      id: "cookies",
      label: "Clear Cookies",
    },
    {
      id: "localStorage",
      label: "Clear Local Storage",
    },
    {
      id: "sessionStorage",
      label: "Clear Session Storage",
    },
    {
      id: "indexedDB",
      label: "Clear indexedDB Storage",
    },
  ];

  const allSelected = choices.length === items.length;

  const handleChange = (item: Choice): void => {
    setChoices((prevChoices) => {
      const isSelected = prevChoices.includes(item.id);
      return isSelected ? prevChoices.filter((id) => id !== item.id) : [...prevChoices, item.id];
    });
  };

  const handleSelectAllChange = () => {
    if (allSelected) {
      setChoices([]);
    } else {
      setChoices(items.map(item => item.id));
    }
  };

  const handleClearCacheAndReload = async () => {
    try {
      // Get the current tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];

      if (tab && tab.id && tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("about://")) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: async (selectedChoices) => {
            // Clear cache
            if (selectedChoices.includes("cache")) {
              caches.keys().then(keys => {
                keys.forEach(key => caches.delete(key));
              });
            }

            // Clear localStorage
            if (selectedChoices.includes("localStorage")) {
              localStorage.clear();
            }

            // Clear sessionStorage
            if (selectedChoices.includes("sessionStorage")) {
              sessionStorage.clear();
            }

            // Clear indexedDB
            if (selectedChoices.includes("indexedDB")) {
              const dbs = await indexedDB.databases();
              dbs.forEach((db: IDBDatabaseInfo) => db.name ? indexedDB.deleteDatabase(db.name) : null);
            }
          },
          args: [choices]
        });

        if (choices.includes("cookies")) {
          // Retrieve all cookies for the current domain
          const cookies = await chrome.cookies.getAll({ url: tab.url });

          if (cookies.length > 0) {
            const removePromises = cookies.map(cookie => tab.url && cookie.name ? chrome.cookies.remove({ url: tab.url, name: cookie.name }) : Promise.resolve());

            await Promise.all(removePromises);

            console.log(`${cookies.length} cookies removed.`);
          } else {
            console.log("No cookies to remove.");
          }
        }

        await chrome.tabs.reload(tab.id, { bypassCache: true });
      }
      window.close();
    } catch (err) {
      console.error("Error accessing storage:", err);
      window.close();
    }
  };


  return (
    <div className="w-64">
      <table className="table-fixed w-full border-collapse">
        <thead>
          <tr>
            <th className="w-9 p-2 border-b border-r border-gray-300">
              <Checkbox
                className="flex h-4 w-4"
                id="selectAll"
                checked={allSelected}
                onCheckedChange={handleSelectAllChange}
              />
            </th>
            <th className="p-2 border-b border-l border-gray-300 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td className="w-9 p-2 border-r border-gray-300">
                <Checkbox
                 className="flex h-4 w-4"
                  id={item.id}
                  checked={choices.includes(item.id)}
                  onCheckedChange={() => handleChange(item)}
                />
              </td>
              <td className="p-2 text-left">{item.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={handleClearCacheAndReload} className="mt-4">
        Clear & Reload
      </Button>
    </div>
  );
};

export default ClearCacheAndReload;
