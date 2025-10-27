import styled from 'styled-components'
import {useState} from 'react'

function AddressSelect(props){
    let provinceList = props.provinceList;
    let districtList = props.districtList;
    let setProvince = props.setProvince;
    let setDistrict = props.setDistrict;

    let [open, setOpen] = useState(false);
    let [secOpen, setSecOpen] = useState(false);
    let [curValue, setCurValue] = useState(provinceList[0]);
    let [secCurValue, setSecCurValue] = useState(districtList[provinceList[0]][0]);
    let [specList, setSpecList] = useState(districtList[provinceList[0]]);

    return(
        <>
            <SelectBox onClick={()=>{
                setOpen(!open)
            }}>
                <Label>{curValue}</Label>
                <SelectOptions show={open}>
                {
                    provinceList.map(function(a, i){
                        return(
                            <Option key={i} onClick={(e)=>{
                                e.stopPropagation();
                                setCurValue(provinceList[i]);
                                setProvince(provinceList[i]);
                                setSpecList(districtList[provinceList[i]]);
                                setSecCurValue(districtList[provinceList[i]][0]);
                                setDistrict(districtList[provinceList[i]][0]);
                                setOpen(false);
                            }}>{provinceList[i]}</Option>
                        )
                    })
                }   
                </SelectOptions>
            </SelectBox>
            <SelectBox onClick={()=>{
                setSecOpen(!secOpen)
            }}>
                <Label>{secCurValue}</Label>
                <SelectOptions show={secOpen}>
                {
                    specList.map(function(a, i){
                        return(
                            <Option key={i} onClick={(e)=>{
                                e.stopPropagation();
                                setSecCurValue(specList[i]);
                                setDistrict(specList[i]);
                                setSecOpen(false);
                            }}>{specList[i]}</Option>
                        )
                    })
                }   
                </SelectOptions>
            </SelectBox>
        </>
    )
}

const SelectBox = styled.div`
    position: relative;
    display:flex;
    align-items:right;
    width: 380px;
    padding: 18px 24px;
    border-radius: 12px;
    height: 61px;
    background-color: #E6E6E6;
    align-self: center;
    cursor: pointer;
    &::before {
        content: "⌵";
        position: absolute;
        top: 20%;
        right: 5%;
        color: #000;
        font-size: 20px;
    }
`;
const Label = styled.label`
  font-size: 16px;
`;
const SelectOptions = styled.ul`
  position: absolute;
  list-style: none;
  top: 110%;
  left: 0;
  width: 100%;
  overflow: auto;
  height: 90px;
  max-height: ${(props) => (props.show ? "none" : "0")};
  padding: 0;
  border-radius: 8px;
  background-color: #fff;
  color: #000;
  z-index:1;

  &::-webkit-scrollbar{
    width:8px;
  }

  &::-webkit-scrollbar-thumb {
    height: 20%; /* 스크롤바의 길이 */
    background: #000; /* 스크롤바의 색상 */
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #E6E6E6;  /* 스크롤바 뒷 배경 색상 */
  }
`;
const Option = styled.li`
  font-size: 14px;
  padding: 6px 8px;
  transition: background-color 0.2s ease-in;
  border-bottom: 1px solid #E6E6E6;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #E6E6E6;
  }
`;

export default AddressSelect;