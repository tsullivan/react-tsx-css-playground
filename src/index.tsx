// {{{ IMPORTS
import { createRoot } from "react-dom/client";
import * as React from "react";
import { useState } from "react";
import "./styles.css";
// }}}

// {{{ API START
function simulateResponseTime({ min, max }: { min: number; max: number }) {
  return Math.floor(Math.random() * (max - min) + min);
}

function simulateError({ odds, outOf }: { odds: number; outOf: number }) {
  const rand = Math.floor(Math.random() * outOf);
  return rand === odds;
}

const mockUsers = [
  "John Doe",
  "Jane Smith",
  "Alex Johnson",
  "Emily Brown",
  "Michael Williams",
  "Sarah Jones",
  "David Miller",
  "Emma Davis",
  "Daniel Garcia",
  "Olivia Martinez",
];

function suggestUser(searchTerm: string): Promise<string[]> {
  searchTerm = searchTerm.trim().toLowerCase();
  return new Promise((resolve, reject) => {
    if (simulateError({ odds: 1, outOf: 6 })) {
      reject(500);
    } else {
      window.setTimeout(() => {
        resolve(mockUsers.filter((u) => u.toLowerCase().includes(searchTerm)));
      }, simulateResponseTime({ min: 350, max: 1350 }));
    }
  });
}
// }}}

// {{{ DEBOUNCE
function debounce<T extends any[], U>(
  func: (...args: T) => Promise<U>,
  delay: number
): (...args: T) => Promise<U> {
  let timeoutId: NodeJS.Timeout;
  return function (...args) {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        resolve(func.apply(func, args));
      }, delay);
    });
  };
}
// }}}

// {{{ SEARCH INPUT
const SearchInput = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [term, setTerm] = useState<string | undefined>();
  const [cache, setCache] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedFetchData = debounce<[string], string[]>(
    async (inputValue) => suggestUser(inputValue),
    400
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const inputValue = e.target.value;
    setTerm(inputValue);

    if (inputValue === "") {
      return;
    }

    setIsLoading(true);

    const resultsFromCache = cache[inputValue];
    if (resultsFromCache) {
      setUsers(resultsFromCache);
      setIsLoading(false);
    }

    debouncedFetchData(inputValue)
      .then((usersData) => {
        setIsLoading(false);

        if (!resultsFromCache) {
          setUsers(usersData);
        }

        if (usersData.length > 0) {
          setCache({ ...cache, [inputValue]: usersData });
        }
      })
      .catch(setError);
  };

  return (
    <>
      <input list="users" onChange={onChange} placeholder="Search..." />
      {error ? (
        <p>Search error: {error.toString()}</p>
      ) : (
        <DataList isLoading={isLoading} term={term} users={users} />
      )}
    </>
  );
};
// }}}

// {{{ DATALIST
interface DataListProps {
  isLoading: boolean;
  term: string | undefined;
  users: string[];
}

const DataList = ({ isLoading, term, users }: DataListProps) => {
  if (!term) {
    return null;
  }

  if (isLoading) {
    return <p>{"Loading...Please wait..."}</p>;
  }

  if (users.length === 0) {
    return <p>{"No results"}</p>;
  }

  return (
    <datalist id="users">
      {users.map((user, idx) => (
        <option key={`user-${idx}`} value={user} />
      ))}
    </datalist>
  );
};
// }}}

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<SearchInput />);

// vim:fileencoding=utf-8:foldmethod=marker
