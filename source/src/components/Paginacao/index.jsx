import styles from "./paginacao.module.css"
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
export default function Paginacao({ text, totalPáginas }) {
    return (
        <div className={styles.paginacao}>
            <p className={styles.text}>{text}</p>
            <Stack spacing={5}>
                <Pagination count={totalPáginas} variant="outlined" shape="rounded" />
            </Stack>
        </div>
    )
}