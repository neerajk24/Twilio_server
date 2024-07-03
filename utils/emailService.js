export default function getPhoneNumber(email , ListofUsers){
    console.log(`Email : ${email} , List : ${ListofUsers}`);
    const data = ListofUsers.find((user)=> user.Email === email.toString());
    console.log(data);
    return data.phoneNumber;
}