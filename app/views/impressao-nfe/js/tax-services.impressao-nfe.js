/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão: 1.0 - 03/09/2015
 *
 */

// App
angular.module("tax-services-impressao-nfe", ['ui.router','utils', 'webapi']) 

.controller("tax-services-impressao-nfeCtrl", 
                                           ['$rootScope',
                                            '$scope',   
                                            '$location',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',    
                                            function($rootScope,$scope,$location,/*$campos,*/
                                                     $webapi,$apis,$timeout){ 
   
    $scope.notadetalhada = undefined; 
    // flags
    $scope.exibeTela = false;  
    $scope.manutencao = false;                                                                       
                                                
    // Inicialização do controller
    $scope.taxServices_impressaoNfeInit = function(){
        
        var k = $location.search().k;
        var t = $location.search().t;
        
        if(!k || !t) return;
        
        // Deleta o parâmetro token da url
        $location.search('t', null);
        
        obtemDetalhesNota(k, t, function(){ $scope.exibeTela = true; 
                                            $timeout(function(){$scope.imprime();}, 1500) });
    }     
    
    
  
    // DETALHES
    /**
      * Obtém string com '<código> - <descricao/nome>'
      */
    $scope.getCodigoTracoDescricao = function(obj){
        var text = '';
        if(obj){
            if(typeof obj.codigo === 'number' || typeof obj.codigo === 'string'){ 
                text = obj.codigo + '';
                if(typeof obj.descricao === 'string') text += ' - ' + obj.descricao;
                else if(typeof obj.nome === 'string') text += ' - ' + obj.nome;
            }else if(typeof obj.descricao === 'string') text = obj.descricao;
            else if(typeof obj.nome === 'string') text = obj.nome;
        }
        return text;//.toUpperCase();
    }
    
    /**
     * Retorna a data do tipo Date yyyy-MM-dd em string dd/MM/yyyy
     */
    $scope.getDataString = function(data){
        if(typeof data !== 'undefined' && data !== null){ 
            if(typeof data.getDate === 'function')
                return data.getDate() + '/' + (data.getMonth() + 1) + '/' +  data.getFullYear();
            return data.substr(8, 2) + '/' + data.substr(5, 2) + '/' + data.substr(0, 4);
        }
        return '';
    };
    $scope.getDataTimeString = function(data){
        // 2015-07-21T10:51:15.917  
        if(typeof data !== 'undefined' && data !== null){ 
            var dt = data.substr(8, 2) + '/' + data.substr(5, 2) + '/' + data.substr(0, 4) + 
                     ' ' + data.substr(11,8);
            var index = dt.indexOf('-');
            if(index > -1) dt = dt.substr(0, index);
            return dt;
        }
        return '';
    }; 
    
    /**
      * Requisita informações detalhadas da nota fiscal eletrônica
      */
    var obtemDetalhesNota = function(k, t, funcaoSucesso){   
       showProgress();
        
       // Filtros    
       var filtro = {id : /*$campos.tax.tbmanifesto.nrChave*/ 101,
                     valor : k};
       
       $webapi.get($apis.getUrl($apis.tax.tbmanifesto, [t, 4], filtro)) 
            .then(function(dados){
                // Obtém os dados
                $scope.notadetalhada = undefined;
           
                if(dados.Registros.length > 0) $scope.notadetalhada = dados.Registros[0].notas[0];

                if(typeof funcaoSucesso === 'function') funcaoSucesso();
           
                // Fecha os progress
                hideProgress();
              },
              function(failData){
                 if(failData.status === 0) showModalAlerta('Falha de comunicação com o servidor'); 
                 else if(failData.status === 503 || failData.status === 404) $scope.manutencao = true;
                 else showModalAlerta('Houve uma falha ao obter detalhes da NF-e (' + failData.status + ')');
                 hideProgress();
              });     
    }  
    
    
    
    
    
    
    
    // UTILS
    
   /**
     * Impressão
     */
   $scope.imprime = function(){
       window.print();    
   }
    
   // PROGRESS                        
    /**
     * Exibe o loading progress no portlet-body
     */
   var showProgress = function(){
        Metronic.blockUI({
            animate: true,
            overlayColor: '#000'
        }); 
   };
   /**
     * Remove da visão o loading progress no portlet-body
     */                         
   var hideProgress = function(){
        Metronic.unblockUI();
   };                                            
   
   // MODAL ALERTA
    $scope.alerta = {titulo : '', mensagem : '', textoOk : 'Ok', funcaoOk: function(){}};
    var fechaModalAlerta = function(){
        $('#modalAlerta').modal('hide');    
    }; 
    /**
      * Exibe modal com a mensagem de alerta
      */
    var showModalAlerta = function(mensagem, titulo, textoOk, funcaoOk){
        $scope.alerta.titulo = titulo ? titulo : 'Info';
        $scope.alerta.mensagem = mensagem ? mensagem : 'Mensagem';
        $scope.alerta.textoOk = textoOk ? textoOk : 'Ok';
        $scope.alerta.funcaoOk = typeof funcaoOk === 'function' ? 
                                    function(){fechaModalAlerta(); funcaoOk();}  :  
                                    function(){fechaModalAlerta()};
        // Exibe o modal
        $('#modalAlerta').modal('show');
        if(!$scope.$$phase) $scope.$apply();
    }
    
}]);