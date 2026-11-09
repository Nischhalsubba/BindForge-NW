export async function emailAuth(client,{action,email,password='',redirectTo}){
 if(!client)throw Error('Account connection is unavailable.');if(!/^\S+@\S+\.\S+$/.test(email))throw Error('Enter a valid email address.');
 if(['signup','signin'].includes(action)&&!password)throw Error('Enter your password.');if(action==='signup'&&(password.length<8||new TextEncoder().encode(password).length>72))throw Error('Use at least 8 characters and no more than 72 bytes for your password.');
 let response;if(action==='signup')response=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:redirectTo}});else if(action==='signin')response=await client.auth.signInWithPassword({email:email.trim(),password});else if(action==='reset')response=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo});else throw Error('Unknown account action.');if(response.error)throw response.error;return response.data;
}
