import { createRoot } from 'react-dom/client';
import * as React from 'react';

import './styles.css';

// --------------- API START --------------
function simulateResponseTime({ min, max }: { min: number; max: number }) {
  return Math.floor(Math.random() * (max - min) + min);
}

const mockUsers = [
  'John Doe',
  'Jane Smith',
  'Alex Johnson',
  'Emily Brown',
  'Michael Williams',
  'Sarah Jones',
  'David Miller',
  'Emma Davis',
  'Daniel Garcia',
  'Olivia Martinez',
];

function suggestUser(str: string): Promise<string[]> {
  str = str.trim().toLowerCase();
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(mockUsers.filter((u) => u.toLowerCase().includes(str)));
    }, simulateResponseTime({ min: 350, max: 1350 }));
  });
}
// ---------------- API END ---------------

function debounce<T, U>(func: Function, delay: number): (args: T) => Promise<U> {
  let timeoutId: NodeJS.Timeout;
  return function(...args) {
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

const SearchInput = () => {
  const [users, setUsers] = React.useState<string[]>([]);
  const [term, setTerm] = React.useState<string | undefined>();
  const [cache, setCache] = React.useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const debouncedFetchData = debounce<string, string[]>(async (inputValue: string) => suggestUser(inputValue), 400);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTerm(inputValue);

    if (inputValue === '') {
      return;
    }

    setIsLoading(true);

    const resultsFromCache = cache[inputValue];
    if (resultsFromCache) {
      setUsers(resultsFromCache);
      setIsLoading(false);
    }

    debouncedFetchData(inputValue).then((usersData) => {
      setIsLoading(false);

      if (!resultsFromCache) {
        setUsers(usersData);
      }

      if (usersData.length > 0) {
        setCache({ ...cache, [inputValue]: usersData });
      }
    });
  };

  return (
    <>
      <input list="users" onChange={onChange} placeholder="Search..." />
      <DataList isLoading={isLoading} term={term} users={users} />
    </>
  );
};

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
    return <p>{'Loading...Please wait...'}</p>;
  }

  if (users.length === 0) {
    return <p>{'No results'}</p>;
  }

  return (
    <datalist id="users">
      {users.map((user, idx) => (
        <option key={`user-${idx}`} value={user} />
      ))}
    </datalist>
  );
};

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<SearchInput />, );
