import { useState } from 'react';
import styles from './searchInput.module.css';
import { IoSearch } from "react-icons/io5";

export default function SearchInput({text, onChange, placeholder}) {
    const [valor, setValor] = useState(text || '');
    return (
        <div className={styles.searchInput}>
            <IoSearch color="#6B7280" />
            <input 
                placeholder={placeholder} 
                value={valor}
                onChange={(e) => {
                    setValor(e.target.value);
                    if (onChange) {
                        onChange(e.target.value);
                    }
                }}
            />
        </div>
    );
}