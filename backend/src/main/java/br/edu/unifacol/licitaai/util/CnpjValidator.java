package br.edu.unifacol.licitaai.util;
public final class CnpjValidator {
    private CnpjValidator(){}
    public static boolean isValid(String valor){
        if(valor==null)return false;
        String n=valor.replaceAll("\\D","");
        if(n.length()!=14 || n.chars().distinct().count()==1)return false;
        int[] p1={5,4,3,2,9,8,7,6,5,4,3,2};
        int[] p2={6,5,4,3,2,9,8,7,6,5,4,3,2};
        int d1=digito(n.substring(0,12),p1);
        int d2=digito(n.substring(0,12)+d1,p2);
        return n.endsWith(""+d1+d2);
    }
    private static int digito(String base,int[] pesos){
        int soma=0; for(int i=0;i<pesos.length;i++) soma+=(base.charAt(i)-'0')*pesos[i];
        int resto=soma%11; return resto<2?0:11-resto;
    }
    public static String format(String valor){
        String n=valor.replaceAll("\\D","");
        return n.substring(0,2)+"."+n.substring(2,5)+"."+n.substring(5,8)+"/"+n.substring(8,12)+"-"+n.substring(12);
    }
}
