import { useState } from 'react';
import './home_.css';
import './search_.css';
import { useNavigate } from 'react-router-dom';
import SearchCategory from './search_category.jsx';

function Search(){
    let category = ['카테고리', 'IT', '사업', '디자인', '언어', '시험', '공부', '일상',
        '기타'
    ]

    let [newCategory, setNewCategory] = useState('카테고리');

    let navigate = useNavigate();

    return(
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
            </div>
            
            <div className='search-ing-container'>
                <SearchCategory category={category} setNewCategory={setNewCategory}/>
                <span className='search-ing-line'></span>
                <input className='search-ing-input' type='text'                 
                />
            </div>
        </div>
    )
}

export default Search;