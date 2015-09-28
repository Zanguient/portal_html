/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 25/09/2015
 *
 */

// App
angular.module("tax-services-recebimento-nfe", []) 

.controller("tax-services-recebimento-nfeCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            '$window',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',
                                            '$filter',
                                            function($scope,$state,$http,$window,/*$campos,*/
                                                     $webapi,$apis,$timeout,$filter){ 
   
    $scope.confirmRecebimento = false;
    $scope.paginaInformada = 1;                                          
    $scope.itens_pagina = [50, 100, 150, 200];                                      
    $scope.filtro = { itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, chaveAcesso : null};                                           
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyManifestoPos = 1; // posição da div que vai receber o loading progress                                         
    // flags                                   
    $scope.exibeTela = false;                                                                                                    
                                                
    // Inicialização do controller
    $scope.taxServices_recebimentoNfeInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Nota Fiscal Eletrônica';                          
        $scope.pagina.subtitulo = 'Recebimento NFE';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Refaz busca
                    // ...
                }else{ // reseta tudo e não faz buscas 
                    // reseta array... 
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // faz busca inicial....
        }); 
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        // ... busca inicial
    };                                           
                                                
                                            
    
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           // busca recebimentos.... 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        //if($scope.recebimentos.length > 0) // busca recebimentos....    
    };
                                                
                                                
    /* FILTRO */
                                                
   /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
        var filtros = [];
        
        if($scope.filtro.chaveAcesso && $scope.filtro.chaveAcesso !== null){
               filtros.push({id: /*$campos.tax.tbmanifesto.nrCNPJ*/ 101, 
                             valor: $scope.filtro.chaveAcesso}); 
           }
         return filtros.length > 0 ? filtros : undefined;
    }
    
    
    /**
      * Obtem o manifesto a partir da Chave de Acesso
      */
    $scope.buscaManifestos = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        /*if($scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
           return;
        }*/
        
        // Nova busca
        buscaManifestos();
    }
                                                
    var buscaManifestos = function(){
        // Abre os progress
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyManifestoPos);
        
       // Filtros    
       var filtros = obtemFiltrosBusca();
           
       //console.log(filtros);
       if( filtros !=  undefined)
       {
           $scope.manifestos = undefined;
           $scope.confirmRecebimento = false;
           
           $webapi.get($apis.getUrl($apis.tax.tbmanifesto, 
                                    [$scope.token, 6, /* $campos.tax.tbmanifesto.dtemissao */101],
                                    filtros)) 
                .then(function(dados){
                    // Guarda o último filtro utilizado
                    ultimoFiltroBusca = filtros;

                    // Obtém os dados
                    $scope.manifestos = dados.Registros;
                    console.log(!$scope.manifestos[0].flEntrega);
                   if( ($scope.manifestos.length > 0) && (!$scope.manifestos[0].flEntrega) )
                       $scope.confirmRecebimento = true;
               
                    // Set valores de exibição
                    $scope.filtro.total_registros = dados.TotalDeRegistros;
                    $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                    if($scope.manifestos.length === 0) $scope.faixa_registros = '0-0';
                    else{
                        var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                        var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                        if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                        $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                    }
                    // Verifica se a página atual é maior que o total de páginas
                    if($scope.filtro.pagina > $scope.filtro.total_paginas)
                        setPagina(1); // volta para a primeira página e refaz a busca

                    // Fecha os progress
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyManifestoPos);
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao obter manifestos (' + failData.status + ')', true, 'danger', true);
                    // Quando a busca for por chave de acesso, força o usuário digitar a Chave de Acesso
               
                     // Fecha os progress
                     $scope.hideProgress(divPortletBodyFiltrosPos);
                     $scope.hideProgress(divPortletBodyManifestoPos);
               
                     // Exibe o modal informando a obrigatoriedade da chave de acesso
                     $scope.showModalAlerta('Por favor, digite a Chave de Acesso', 'Atos Capital', 'OK', function(){} );
                  });           
       }
        
    }
    
    /**
      * Confirma Recebimento da NF-e
      */
    $scope.confirmaVirgencia = function(){
        
        // Verifica se a busca foi executada, se houve resultado e a confirmação já ocorreu
        if( $scope.manifestos.length === 0 && $scope.confirmRecebimento === false)  return;
        
        // Parametros 
        var jsonRecebimento = {
                                  idManifesto: $scope.manifestos[0].idManifesto,
                                  cdGrupo: $scope.manifestos[0].cdGrupo,
                                  flEntrega: true
                                };; 
        
        
        // UPDATE
        $scope.showProgress();
        $webapi.update($apis.getUrl($apis.tax.tbmanifesto, undefined,
                                 {id : 'token', valor : $scope.token}), jsonRecebimento) 
            .then(function(dados){           
                $scope.showAlert('Recebimento de NF-e confirmado com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else if(failData.status === 500) $scope.showAlert('Houve uma falha ao confirmar o recebimento da NF-e (' + failData.status + ')', true, 'danger', true);
                 else $scope.showAlert('Houve uma falha ao confirmar o recebimento da NF-e (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress();
              });   
        
        $scope.confirmRecebimento = false;
    }
    
}])